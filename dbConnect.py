"""Read write to Azure SQL database from pandas"""
import pyodbc
import pandas as pd
import numpy as np
from sqlalchemy import create_engine

# 1. Constants
AZUREUID =  # Azure SQL database userid
AZUREPWD =  # Azure SQL database password
AZURESRV =  # Azure SQL database server name (fully qualified)
AZUREDB =   # Azure SQL database name (if it does not exit, pandas will create it)
TABLE =     # Azure SQL database table name
DRIVER =    # ODBC Driver
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