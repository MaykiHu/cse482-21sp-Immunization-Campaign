"""Read write to Azure SQL database from pandas"""
import pyodbc
import pandas as pd
import numpy as np
from sqlalchemy import create_engine

# 1. Constants
AZUREUID =                                   # Azure SQL database userid
AZUREPWD =                                # Azure SQL database password
AZURESRV =  # Azure SQL database server name (fully qualified)
AZUREDB =                        # Azure SQL database name (if it does not exit, pandas will create it)
TABLE =                                      # Azure SQL database table name
DRIVER =                  # ODBC Driver

def main():
    """Main function"""

    # 2. Build a connectionstring
    connectionstring = 'mssql+pyodbc://{uid}:{password}@{server}:1433/{database}?driver={driver}'.format(
        uid=AZUREUID,
        password=AZUREPWD,
        server=AZURESRV,
        database=AZUREDB,
        driver=DRIVER.replace(' ', '+'))


    # 4. Create SQL Alchemy engine and write data to SQL
    engn = create_engine(connectionstring)

    # 5. Read data from SQL into dataframe
    query = 'SELECT * FROM {table}'.format(table=TABLE)
    dfsql = pd.read_sql(query, engn)

    print(dfsql.head())


if __name__ == "__main__":
    main()