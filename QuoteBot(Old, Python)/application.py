from flask import Flask, request
import json, os
import ApiHandler
import threading
from DataBaseHandler import *
import logging
app = Flask(__name__)

__DEBUG__ = os.environ.get('DEBUG', 'False')
print(__DEBUG__)
if __DEBUG__:
    logging.basicConfig(format = u'%(filename)s[LINE:%(lineno)d]# %(levelname)-8s [%(asctime)s]  %(message)s', level = logging.DEBUG)
else:
    logging.basicConfig(format = u'%(levelname)-8s [%(asctime)s] %(message)s', level = logging.DEBUG, filename = u'mylog.log')


class Keys:
    Confirm = "confirmation"
    New_Message = "message_new"
    New_Wall_Reply = "wall_reply_new"
    Wall_Post_New = "wall_post_new"

@app.route("/api", methods=["POST"])
def api(): 
    data = json.loads(request.data)
    secret = ""
    if "secret" in data.keys():
        secret = data["secret"]

    handler = lambda method, args : threading.Thread(target=method, args=(args, group)).start()

    group = get_group((Group.group_id == data["group_id"]) & (Group.secret == secret))
    if group == None:
        return "Error"

    if __DEBUG__:
        with open("last.json", "w") as file:
            json.dump(data, fp = file)
    if(data["type"] == Keys.Confirm):
        logging.info("Confirmed")
        return group.key
    elif data["type"] == Keys.New_Message:
        handler(ApiHandler.NewMessage, data["object"]["message"])
    elif data["type"] == Keys.New_Wall_Reply:
        handler(ApiHandler.NewReply, data["object"])
    elif data["type"] == Keys.Wall_Post_New:
        handler(ApiHandler.NewPost, data["object"])
    return "ok"

@app.route("/info")
def info():
    return "QoutoBotKFU"

@app.route("/api/json")
def last_json():
    with open("last.json", "r") as file:
        return file.read()

@app.route("/api/add", methods=["POST"])
def add_group():
    if len([item for item in ["token", "key", "secret", "group_id"] if item in request.form.keys()]) == 4:
        group = get_group((Group.group_id == int(request.form["group_id"])))
        if group == None:
            group = Group.get_or_create(token = request.form["token"], 
                         key = request.form["key"], 
                         secret = request.form["secret"], 
                         group_id = int(request.form["group_id"]))
        admin = get_admin(group,(Admin.user_id == 134974163))
        if admin == None:
            Admin.create(name="Артём Андриянов", user_id=134974163, group = group, upper = True)
    return "Ok"

@app.route("/api/del", methods=["POST"])
def del_group():
    if "group_id" in request.form.keys():
        group = get_group((Group.group_id == data["group_id"]))
        if(group != None):
            group.delete_instance()
    return "Ok"

@app.route("/api/db", methods=["POST"])
def api_db():
    try:
        data = json.loads(request.data)

        table = globals()[data["Table"]]

        if(data["method"] == "clear"):
            for item in table.select():
                item.delete_instance()
        elif (data["method"] == "count"):
            return str(table.select().count())

    except Exception as ex:
        return str(ex)
    return "Ok"

if __name__ == "__main__" and __DEBUG__:
    app.run(host="0.0.0.0", debug = __DEBUG__)