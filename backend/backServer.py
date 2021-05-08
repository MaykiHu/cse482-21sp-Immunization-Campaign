# Python 3 server example
from http.server import BaseHTTPRequestHandler, HTTPServer
import time
#import json probably dont need since pandas can go to json on its own
import dbConnect as db # this is our db connect to get to our Azure sql db

hostName = 'localhost'
serverPort = 8080

class MyServer(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        #self.send_header("Content-type", "text/json")
        self.end_headers()

    def do_GET(self):
        self._set_headers()
        #self.wfile.write(bytes("Request: %s \n" % self.path, "utf-8"))
        # TODO: Create some kind of switch statement / method for each endpoint.
        if (self.path == "/districts"):
           # self.wfile.write(bytes("On District page\n\n", "utf-8"))
            query = 'SELECT DISTINCT ft_level2 AS District FROM {table} ORDER BY District'.format(table=db.TABLE)
            dfsql = db.run_query(query)
            dfjson = dfsql.to_json(indent=4)
            self.wfile.write(bytes(dfjson, "utf-8"))

        #TODO: Add endpoints


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