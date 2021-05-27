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
dfState = None
abbrevs = {"Uganda": "UG", "Kenya": "KE", "Mali": "MAL", "Zimbabwe": "ZIM", "Benin": "BE"}
total_doses = 0
dfPriority = pd.DataFrame(columns = ['DISTIRCT','PRIORITY', 'TOTAL_POP', 'POP_VACCINATED', 'CAMPAIGN_LENGTH'])
dfNumVaccine = pd.DataFrame(columns = ['DISTIRCT','PRIORITY','CAMPAIGN_LENGTH','NUM_VACCINE'])
num_vaccines = None
country = None
dfPrevCampaigns = None

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
            countryDrop = self.path.split('-')[0].replace("/", "").strip()
            query = 'SELECT DISTINCT ft_level2 AS District FROM {country}_FACILITIES ORDER BY District'.format(country=abbrevs[countryDrop])
            dfsql = db.run_query(query)
            dfjson = dfsql.to_json(indent=4)
            self.wfile.write(bytes(dfjson, "utf-8"))

    
    def do_POST(self) :
        self._set_headers()
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={'REQUEST_METHOD': 'POST'}
        )
        if (self.path == "/results") :
            # Do what you wish with file_content
            fileItem = form['covidFile']
            # name of file
            covidName = fileItem.filename
            # file data as bytes
            #print(fileItem.value)
            global dfCovid
            # set index so we can lookup rows by district
            dfCovid = pd.read_csv(BytesIO(fileItem.value)).set_index('DISTRICTS') 
            print(dfCovid)
            print()
            

            # General stats file
            fileItem = form['generalFile']
            generalName = fileItem.filename
            global dfGeneral
            dfGeneral = pd.read_csv(BytesIO(fileItem.value)).set_index('DISTRICTS')
            print(dfGeneral)
            print()

            # General stats file
            fileItem = form['stateFile']
            stateName = fileItem.filename
            global dfState 
            dfState = pd.read_json(BytesIO(fileItem.value))

            global country
            country = dfState[0][0] #index of country
            global num_vaccines
            num_vaccines = dfState[0][1] #index of vaccine #
            global dfPrevCampaigns
            prev_campaigns_list = dfState[0][2]
            dfPrevCampaigns = pd.DataFrame(prev_campaigns_list, columns=['DISTRICTS', 'FINISHED'])
            dfPrevCampaigns = dfPrevCampaigns.set_index('DISTRICTS') #Lookup by district       
            retString = "" + covidName + "," + stateName
            print(dfPrevCampaigns)
            print()
            print(retString)
            # self.wfile.write(bytes(retString, "utf-8"))
            # TODO: for each dist in dfPrevCampaigns.index.values priority_score(dist)
            
     
    def priority_score(self, distr): 
        global dfPriority

        # TODO: Grab from user
        distr = 'ADJUMANI'

        #TODO: get data you need all at once and store it globally then do a pull for each district
        '''
           Heads up each of these queries is returning dataframes
           not values so I think it would be better just to load in all of the columns you need
           and then grab the values.

           The less times you run_query, the better
        '''
        # Get number of people under age 15 from database
        query = ('SELECT fi_pop_under15 FROM {country}_ADMIN_AREA WHERE ft_level2 = {district}'
                 .format(country=abbrevs[country], district=distr))
        pop_under15 = db.run_query(query)

        # Estimate population using database info. Add 15% of estimated count to account for error
        query = ('SELECT SUM(fi_tot_pop) FROM {country}_FACILITIES WHERE ft_level2 = {district} '
                 .format(country=abbrevs[country], district=distr))
        estimated_pop = db.run_query(query)
        true_pop = estimated_pop + (estimated_pop * 0.15) 

        # TODO: figure out how get districts where campaign held from front end
        # JSON file: country, district, ?? DONE
        campaign_held = dfPrevCampaigns.loc(distr, "FINISHED") # gets value from dataframe
        percent_vaccinated = dfCovid.loc[distr, 'NUM_VACCINATIED'] / true_pop
        percent_cases = dfCovid.loc[distr, 'NUM_CASES'] / true_pop

        # STEP 1: Evaulate population and impact of outbreak
        if campaign_held or percent_vaccinated > 0.8:
            # Campaign successfully held or herd immunity (80%)
            priority = 1
        else:
            risk_score = 0
            # Intensity and magnitude of transmission: High number of cases means higher priority
            if percent_cases  < 0.2:
                risk_score += 5
            elif percent_cases > 0.2 and percent_cases < 0.4:
                risk_score += 7
            
            # Population susceptibility: High population of kids under 15 means lower risk
            if (pop_under15 / true_pop) > 0.35:
                risk_score += 3
            else:
                risk_score += 5
            
            # Population susceptibility: High population of 60+ year olds means higher risk 
            if (dfGeneral.loc[distr, 'PERCENT_POP_60+'] / true_pop) > 0.35:
                risk_score += 7 
            else:
                risk_score += 4

            # Population susceptibility: Account for percent of population already vaccinated
            if percent_vaccinated < 0.8 and percent_vaccinated > 0.6:
                risk_score += 3
            elif percent_vaccinated < 0.6 and percent_vaccinated > 0.4:
                risk_score += 6
            elif percent_vaccinated < 0.4 and percent_vaccinated > 0.2:
                risk_score += 8
            else:
                risk_score += 10

            # Future implementation: 
            # Geographical spread
            #   1. Higher density populations have higher risk. Need size of district
            #   2. Look at neighboring districts and factor effects on this district 
            #      (e.g if nearby districts have outbreaks, priority increases)

            # Categorize into low (1), moderate (2), and high(3) risk based on risk_score
            if risk_score < 10:
                risk = 1 
            elif risk_score >= 10 and risk_score < 18:
                risk = 2 
            else:
                risk = 3 

        # Priority = [1-5]. 1 = low and 5 = high 
        # COVID-19 Transmissions scenarios
        #   1. Community transmissions: cases > 50% pop
        #   2. Clusters of cases: cases > 30% pop
        #   3. Sporadic cases: cases > 10% pop
        #   4. Little to no cases: < 10% pop
        #
        # Future implementation:
        #   Adjust population percentage levels to better reflect risk and priority
        if  percent_cases >= 0.5 and (risk == 3 or risk == 2):
            priority = 5 
        elif (risk == 1 and percent_cases > 0.1) or (risk == 2 and percent_cases >= 0.3 and percent_cases < 0.5) :
            priority = 3
        elif (risk == 2 and percent_cases < 0.3) or (risk == 3 and percent_cases < 0.5):
            prioirty = 4
        else: 
            priority = 1

        # STEP 2: Evaluation campaign capacity 
        # Assumptions: 
        #   Vaccine locations open for 10 hours/day 
        #   Each location site has min 4 people per team:
        #       - 2 people administering vaccine
        #       - 1 person recording information
        #       - 1 person mobilizing crowds)
        # Goal: Vaccinate >80% of population for herd immunity
        # Future implementation: Account for facility's resupply interval and storage capacity 
        num_to_vaccinate = (true_pop * 0.8) - dfCovid.loc[distr, 'NUM_VACCINATIED']
        vacc_admin_per_day = 10 * 60 * dfCovid.loc[distr, 'MIN_TO_ADMIN_VACC'] * 2 * dfGeneral.loc[distr, 'NUM_VACCINE_SITES']
        campaign_length = num_to_vaccinate / vacc_admin_per_day

        # TODO: factor in num of staff available
        # have x num of locations, have y num of staff, 
        # y / 4 >= x? 

        dfPriority = dfPriority.append({'DISTRICT': distr,'PRIORITY': priority, 'TOTAL_POP': true_pop, 
                    'POP_VACCINATED': dfCovid.loc[distr, 'NUM_VACCINATIED'], 'CAMPAIGN_LENGTH': campaign_length}, ignore_index = True)
                    
    def vacc_alloc (self):
        priority = 5
        distributed = 0
        # Percentage of population to aim to vaccinate depending on priority
        # Priority = 1 --> 10% pop .... Priority = 5 --> 80%
        target_percent = [0.1, 0.2, 0.4, 0.6, 0.8]
        dfPriority = dfPriority.sort_values(by=['PRIORITY'])

        # Prioritize districts with higher priority and distribute vaccines there first
        while priority > 0:
            priority_results = dfPriority.loc[dfPriority['PRIORITY'] == priority]
            for row in dfPriority.iterrows():
                num_vax_needed = ( row['TOTAL_POP'] * target_percent[priority - 1]) - row['POPULATION_TO_VAX']
                if num_vaccines > 0:
                    if num_vaccines >= num_vax_needed:
                        num_vaccines -= num_vax_needed
                        distributed = num_vax_needed
                    else: 
                        # num_vaccines < num_vax_needed
                        distributed = num_vaccines
                        num_vacc = 0
                else: 
                    distributed = 0
                dfNumVacc = dfNumVacc.append({'DISTIRCT': row['DISTIRCT'],'PRIORITY': row.loc['PRIORITY'],
                            'CAMPAIGN_LENGTH': row['CAMPAIGN_LENGTH'],'NUM_VACCINE': distributed}, ignore_index = True)
            priority -= 1

        # Convert results (district, campaign length, num vaccines distributed etc) to json     
        dfjson = dfNumVacc.to_json(indent=4)
        self.wfile.write(bytes(dfjson, "utf-8"))

        

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