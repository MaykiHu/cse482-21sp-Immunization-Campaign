# Python 3 server example
from http.server import BaseHTTPRequestHandler, HTTPServer
import time
from urllib import parse
import cgi
from io import BytesIO
import pandas as pd
#import json probably dont need since pandas can go to json on its own
import dbConnect as db # this is our db connect to get to our Azure sql db

hostName = 'localhost'
serverPort = 8080
dfCovid = None
dfGeneral = None
abbrevs = {"Uganda": "UG", "Kenya": "KE", "Mali": "MAL", "Zimbabwe": "ZIM", "Benin": "BE"}

class MyServer(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        #self.send_header("Content-type", "text/json")
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.end_headers()

    def do_GET(self):
        self._set_headers()
        # TODO: Create some kind of switch statement / method for each endpoint.

        if ("-districts" in self.path):
            country = self.path.split('-')[0].replace("/", "").strip()
            query = 'SELECT DISTINCT ft_level2 AS District FROM {country}_FACILITIES ORDER BY District'.format(country=abbrevs[country])
            dfsql = db.run_query(query)
            dfjson = dfsql.to_json(indent=4)
            self.wfile.write(bytes(dfjson, "utf-8"))



        # #TODO: Add endpoints
        # if ("/UG" in self.path):
        #     parsed = parse.urlsplit(self.path)
        #     print(parsed)
        #     qDict = parse.parse_qs(parsed.query)
        #     print(qDict)
        #     print(qDict["vacc"])
            # query = 'SELECT DISTINCT ft_level2 AS District FROM {table} ORDER BY District'.format(table=db.TABLE)
            # dfsql = db.run_query(query)
            # dfjson = dfsql.to_json(indent=4)
            # self.wfile.write(bytes(dfjson, "utf-8"))
    
    def do_POST(self) :
        self._set_headers()
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={'REQUEST_METHOD': 'POST'}
        )
        
        # Do what you wish with file_content
        fileItem = form['covidFile']
        # name of file
        print(fileItem.filename)
        # file data as bytes
        print(fileItem.value)
        global dfCovid
        # set index so we can lookup rows by district
        dfCovid = pd.read_csv(BytesIO(fileItem.value)).set_index('DISTRICTS') 

        # General stats file
        fileItem = form['generalFile']
        global dfGeneral
        dfGeneral = pd.read_csv(BytesIO(fileItem.value)).set_index('DISTRICTS') 

    def district_score(self, distr): 
        # TODO: Grab from user
        distr = 'ADJUMANI'
        query = 'SELECT fi_pop_under15 FROM UG_ADMIN_AREA WHERE ft_level2 = {district}'.format(district=distr)
        pop_under15 = db.run_query(query)

        query = 'SELECT SUM(fi_tot_pop) FROM UG_FACILITIES WHERE ft_level2 = {district} '.format(district=distr)
        estimated_pop = db.run_query(query)
        true_pop = estimated_pop + (estimated_pop * 0.15) # add 15% of estimated to account for count error

        # TODO: figure out how get data from front end
        campaign_held = False
        percent_vaccinated = dfCovid.loc[distr, 'NUM_VACCINATIED'] / true_pop
        percent_cases = dfCovid.loc[distr, 'NUM_CASES'] / true_pop

        # Assumption: outbreak defined as >30% of population has covid. Can change so user inputs base percentage
        # Priority = [1-5], where 1 = low, 5 = high 
        if  percent_cases > 0.6:
            priority = 5 # high intensity outbreak
        elif percent_cases > 0.4:
            priority = 4 # moderate outbreak
        elif campaign_held or percent_vaccinated > 0.80:
            #campaign held or herd immunity (80%)
            priority = 1
        else:
            priority_score = 0
            #intensity and magnitude of transmission
            if percent_cases  < 0.2:
                priority_score += 5
            elif percent_cases > 0.2 and percent_cases < 0.4:
                priority_score += 10
            
            if (pop_under15 / true_pop) > 0.35:
                priority_score += 4 # lower risk grp --> lower priority
            else:
                priority_score += 7
            
            if dfGeneral.loc[distr, 'PERCENT_POP_60+'] > 0.35:
                priority_score += 7 # higher risk grp --> higher priority
            else:
                priority_score += 4

            
        
                   

if __name__ == "__main__":        
    db.connect()
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")