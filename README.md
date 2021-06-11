# -Immunization-Campaign

HOW-TO: Viewing our Project on Web Deployment

If first time opening, please do this in your terminal:
1. cd to website folder. In terminal, run "npm install"
    -This step is to install all needed libraries/packages
    from React and only needs to be done ONCE, the first time
    
Opening the Project (subsequent steps):
1. Run backServer.py in backend folder (see Back End for any additional steps if cannot run)
2. In terminal, cd to website folder (if not already in it)
3. In terminal, run "npm start"
    -This will automatically start and popup the website shortly on localhost:3000
4.  Enjoy!  Please note that the form may take some time to load/populate values
    the first time around, but will be faster subsequent times.

----------------------------------------------------------------------------------

Developer's Note: Do not commit nor push constants in 'dbConnect.py'

Back End
- Need to install
    - python
    - python modules: pyodbc, pandas, sqlalchemy
    - ODBC Driver for SQL Server
- Need to be added to azure server to run project
- Need to add constants/permissions to dbConnect.py (in backend folder)

1. Using terminal run backserver.py
    - If in '-Immunization-Campaign' folder: run "python .\backend\backserver.py" 
2. Open up 'localhost:8080'
3. To see list of countries, open up 'localhost:8080/countries'
