# 1. Build
cd /Users/andrea/Desktop/FrontEnd/finance-tracker
npm run build

# 2. Upload
rsync -avz --delete dist/ root@156.239.40.189:/opt/finance-tracker/frontend/