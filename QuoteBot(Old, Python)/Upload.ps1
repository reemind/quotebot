az webapp stop -n QuoteBotKFU -g KFU
echo Stopped
az webapp up --sku F1 -n QuoteBotKFU -g KFU
ehco Uploaded
az webapp start -n QuoteBotKFU -g KFU
echo Started