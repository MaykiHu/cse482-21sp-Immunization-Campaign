"""Read write to Azure SQL database from pandas"""
import pyodbc
import pandas as pd
import numpy as np
from sqlalchemy import create_engine

# 1. Constants
AZUREUID = "campaigntool482-admin" # Azure SQL database userid
AZUREPWD =  "cse482CPT"# Azure SQL database password
AZURESRV =  "campaigntool482-server.database.windows.net" # Azure SQL database server name (fully qualified)
AZUREDB =   "campaigntool482-db" # Azure SQL database name (if it does not exit, pandas will create it)
DRIVER =    "ODBC Driver 17 for SQL Server"# ODBC Driver
engn = None

def connect():
    # Build a connectionstring
    connectionstring = 'mssql+pyodbc://{uid}:{password}@{server}:1433/{database}?driver={driver}'.format(
        uid=AZUREUID,
        password=AZUREPWD,
        server=AZURESRV,
        database=AZUREDB,
        driver=DRIVER.replace(' ', '+'))

    
    # Create SQL Alchemy engine and write data to SQL
    global engn
    engn = create_engine(connectionstring)
    print("Connected to DB")

# Read data from SQL into dataframe    
def run_query(query):
    dfsql = pd.read_sql(query, engn)
    return dfsql
    

def main():
    """Main function"""
    connect()
    query = 'SELECT * FROM {table}'.format(table=TABLE)
    dfsql = run_query(query)
    print(len(dfsql.columns))
    print(dfsql.head())
    

if __name__ == "__main__":
    main()
