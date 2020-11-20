import json
import re
import logging
import vk
from DataBaseHandler import *

session = vk.Session()
api = vk.API(session, v=5.89)

def send_message(group, user_id, message, attachment=""):
    api.messages.send(access_token=group.token, user_id=str(user_id), message=message, attachment=attachment)
    logging.info("Sent: " + message + "\t\t Att: " + attachment)

def send_reply(group, post, reply_to_comment, message):
    api.wall.createComment(access_token=group.token, owner_id=-group.group_id, post_id=post.post_id, from_group=group.group_id, reply_to_comment=reply_to_comment, message=message)
    logging.info("Reply to post({2}) in group({1}): {0}".format(message, group.group_id, post.post_id))

def get_att(group ,atts):
    wall = [att["wall"] for att in atts if att["type"] == "wall" and att["wall"]["to_id"] == -group.group_id]
    if(len(wall) > 0):
        return wall[0]
    return None

def quotes_list(post):
    resp = ""
    i = 1
    for item in get_quotes(post):
        resp += "{0}. {1}({2})\n".format(i, item.name, item.room)
        i+=1
    if(resp == ""):
        return "Пусто"
    else:
        return resp

def posts_list(group):
    resp = ""
    for item in get_posts(group):
        resp += f"id={item.id} - {item.text}"+("(Закрыто)\n" if item.expired else "\n")
    if(resp == ""):
        return "Пусто"
    else:
        return resp

def admins_list(group):
    resp = ""
    for item in get_admins(group):
        resp += f"@id{item.user_id}({item.name})\n"
    if(resp == ""):
        return "Пусто"
    else:
        return resp

def cut(txt):
    n_ind = txt.find('\n')
    if(n_ind != -1 and n_ind <= 20):
        txt = txt[:n_ind]
    if(len(txt) > 20):
        txt = txt[:17] + "..."

    return txt

def create_post(group, wall, max, admin):
    logging.info("Command - Add")
    txt = cut(wall["text"])
   

    post = Post.create(post_id = int(wall["id"]), expired = False, max = max, text = txt, group = group)                
    if admin != None:
        send_message(group, admin.user_id, "Запись добавлена в очередь: id=" + str(post.id), "wall-{0}_{1}".format(group.group_id, wall["id"]))
    api.wall.createComment(access_token=group.token, owner_id=-group.group_id, post_id=post.post_id, from_group=group.group_id, message="""Привет
    В этом посту квота проверяется автоматически)
    Для внесения в список комментарий следует писать так:

    Иванов Иван 101
    Иванов Иван Иванович 101

    Допускается несколько участников в одном сообщении.
    """)

def NewReply(message, group):
     if re.match(r"\A([\w]+ [\w]+( [\w]+)?) ([\d]{3,4})", message["text"]) != None and not "reply_to_comment" in message.keys():
        post = get_post(group, (Post.post_id == message["post_id"]))
        if post != None:
            regex = re.findall(r"([\w]+ [\w]+( [\w]+)?) ([\d]{3,4})", message["text"])
            count = get_quotes(post).count()
            for match in regex:
                if post.expired:
                    send_reply(group, post, message["id"], "Квота заполнена")

                else:
                    quote = get_quote(post,((Quote.name == match[0]) & (Quote.room == int(match[2]))))
                    if quote == None:
                        Quote.create(comm_id=int(message["id"]), room = int(match[2]), name = match[0], post = post)
                        count+=1
                        send_reply(group, post, message["id"], "{0} из {1}".format(str(count), post.max))
                    else:
                        send_reply(group, post, message["id"], "Такой участник уже в списке")

                    if(post.max == count):
                        post.expired = True
                        post.save()

                    logging.info("Квота на пост {0} заполнена на {1} из {2}".format(post.id, count, post.max))

def NewMessage(message, group):
    text = message["text"]

    response = lambda mes, att="": send_message(group, message["from_id"], mes, att)

    admin = get_admin(group,(Admin.user_id == message["from_id"]))

    if(admin != None):
        logging.info("Admin {0}{1} from group {2}".format(admin.name, "(Upper)" if admin.upper else "", group.group_id))

        wall = get_att(group, message["attachments"])
        post = get_post(group,(Post.post_id == int(wall["id"]))) if wall != None else None
        if re.match(r"\A[Дд]обавить ([\d]{1,3})", text) != None and wall != None:
            if post != None:
                response(f"Запись c id={post.id} уже в очереди", "wall-{0}_{1}".format(group.group_id, wall["id"]))
            else:
                logging.info("Command - Add")
                create_post(group, wall, int(re.match(r"\A[Дд]обавить ([\d]{1,2})", text).groups()[0]), admin)
                
                
                #while(len(comments = api.wall.getComments(access_token=group.token, owner_id = -group.group_id, post_id = wall["id"], count = 100)["items"]) > 0):
                #    for comm in comments:
                #        NewReply(comm, group)


        elif not re.match(r"\A[Пп]роверить ([\d]+)", text) == None:
            id = re.match(r"\A[Пп]роверить ([\d]+)", text).groups()[0]
            post = get_post(group,(Post.id == int(id)))
            if post == None:
                response("Запись не найдена((")
            else:
                response("Список участников:\n"+quotes_list(post))

        
        elif re.match(r"\A[Пп]роверить", text) != None:
            if post == None:
                response("Запись не найдена((")
            else:
                response("Список участников:\n"+quotes_list(post))

        elif not re.match(r"\A[Уу]далить ([\d]+)", text) == None:
            id = re.match(r"\A[Уу]далить ([\d]+)", text).groups()[0]
            post = get_post(group,(Post.id == int(id)))
            if post == None:
                response("Запись не найдена((")
            else:
                response("Вот список перед удалением\n" + quotes_list(post))
                for item in get_quotes(post):
                    item.delete_instance()
                response("Пост({0}) удален".format(post.id))
                post.delete_instance()

        elif re.match(r"\A[Уу]далить", text) != None:
            if post == None:
                response("Запись не найдена((")
            else:
                response("Вот список перед удалением\n" + quotes_list(post))
                for item in get_quotes(post):
                    item.delete_instance()
                response("Пост({0}) удален".format(post.id))
                post.delete_instance()

        elif not re.match(r"\A[Зз]акрыть ([\d]+)", text) == None:
            id = re.match(r"\A[Зз]акрыть ([\d]+)", text).groups()[0]
            post = get_post(group,(Post.id == int(id)))
            if post == None:
                response("Запись не найдена((")
            else:
                post.expired = True
                response(f"Квота поста с id={post.id} закрыта", "wall-{0}_{1}".format(group.group_id, post.post_id))
                

        elif re.match(r"\A[Зз]акрыть", text) != None:
            if post == None:
                response("Запись не найдена((")
            else:
                post.expired = True
                response(f"Квота поста с id={post.id} закрыта", "wall-{0}_{1}".format(group.group_id, post.post_id))

        elif re.match(r"\A[Сс]писок", text) != None:
            response("Список постов:\n"+posts_list(group))

        elif re.match(r"\A[Зз]аадминить https:\/\/vk\.com\/([\S]+)", text) != None and admin.upper:
            name = re.match(r"\A[Зз]аадминить https:\/\/vk\.com\/([\S]+)", text).groups()[0]
            resp = api.users.get(access_token=group.token, user_ids=name)[0]
            admin = Admin.create(user_id=resp["id"], group = group, upper = False, name = resp["first_name"] + " " + resp["last_name"])
            response(f"@id{item.user_id}({item.name}) теперь админ)")

        elif re.match(r"\A[Рр]азадминить https:\/\/vk\.com\/([\S]+)", text) != None and admin.upper:
            name = re.match(r"\A[Рр]азадминить https:\/\/vk\.com\/([\S]+)", text).groups()[0]
            resp = api.users.get(access_token=group.token, user_ids=name)[0]
            admin = get_admin(group, (Admin.user_id == resp["id"]))
            if(admin != None):
                admin.delete_instance();
                response(f"@id{item.user_id}({item.name}) удален)")
            else:
                response("Админ не найден")

        elif re.match(r"\A[Аа]дмины", text) != None and admin.upper:
            response("Список админов:\n"+admins_list(group))

        elif re.match(r"\A[Пп]омощь", text) != None:
            response("""
            Команды, которые ты можешь отправить(допускается написание со строчной буквы)

            Добавить 3(это должен быть репост записи, 3 - это квота)

            Список(список постов, которые отслеживает бот)

            Проверить 1(проверить квоту поста, где 1 - это id поста)

            Проверить(аналогично предыдущей команде, но работает, если это репост записи, которую нужно проверить)

            Закрыть 1(удаляет пост из базы бота, 1 - это id поста)

            Закрыть(аналогично предыдущей команде, но работает, если это репост записи, квоту которой нужно закрыть)

            Удалить 1(удаляет пост из базы бота, 1 - это id поста)

            Удалить(аналогично предыдущей команде, но работает, если это репост записи, которую нужно удалить)

            Замечание: перед удалением будет выведен список участников

            """ + """
            Заадминить http://vk.com/id11111111
            или
            Заадминить http://vk.com/pavel
            (добавить человека в список модеров)

            Разадминить http://vk.com/id11111111
            или
            Разадминить http://vk.com/pavel
            (удалить человека из списка модеров)

            Админы(выводит список модеров)
            """ if admin.upper else "")            



def NewPost(post, group):
    qt = re.search(r"#[Кк]вота([\d]{1,2})", post["text"])
    admin = None
    if "created_by" in post.keys():
        admin = get_admin(group, Admin.user_id == post["created_by"])

    if qt != None:
        count = int(qt.groups()[0])
        create_post(group, post, count, admin)

                


