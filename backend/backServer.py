# Python 3 server example
from http.server import BaseHTTPRequestHandler, HTTPServer
import time
from urllib import parse
import cgi
#import json probably dont need since pandas can go to json on its own
import dbConnect as db # this is our db connect to get to our Azure sql db

hostName = 'localhost'
serverPort = 8080
dfCovid = None

class MyServer(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        #self.send_header("Content-type", "text/json")
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.end_headers()

    def do_GET(self):
        self._set_headers()
        # TODO: Create some kind of switch statement / method for each endpoint.
        if (self.path == "/districts"):
           # self.wfile.write(bytes("On District page\n\n", "utf-8"))
            query = 'SELECT DISTINCT ft_level2 AS District FROM {table} ORDER BY District'.format(table=db.TABLE)
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
        print(fileItem.filename)
        global dfCovid
        dfCovid = db.pd.read_csv(fileItem)

    def district_score(self): 
        distr = "ADJUMANI"
        query = 'SELECT fi_pop_under15 FROM UG_ADMIN_AREA WHERE ft_level2 = {district}'.format(district=distr)
        pop_under15 = db.run_query(query)

        query = 'SELECT SUM(fi_tot_pop) FROM UG_FACILITIES WHERE ft_level2 = {district} '.format(district=distr)
        estimated_pop = db.run_query(query)
        true_pop = estimated_pop + (estimated_pop * 0.15) # add 15% of estimated to account for count error

        #todo: figure out how get data from front end
        campaign_held = False
        num_vaccinated = 100


        # outbreak defined as >30% of population has covid. Can change so user inputs base percentage
        if  (dfCovid.loc[distr, 'NUM_CASES'] / true_pop) > 0.5:
            priority = 5
        elif (dfCovid.loc[distr, 'NUM_CASES'] / true_pop) > 0.3:
            priority = 4
        elif campaign_held or (num_vaccinated / true_pop) > 0.80:
            #campaign held or herd immunity (80%)
            priority = 1        

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