from pymongo import MongoClient
try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client.neuroai
    reports = list(db.reports.find())
    print(f'Total Reports: {len(reports)}')
    if reports:
        print(reports[0])
except Exception as e:
    print(f'Error connecting to MongoDB: {e}')
