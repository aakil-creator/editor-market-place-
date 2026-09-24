import os
path = 'C:/Users/Aaqil/EditorMarketplace/backend/remove_all.py'
if os.path.exists(path):
    os.remove(path)
    print('Done - all scratch files removed')
