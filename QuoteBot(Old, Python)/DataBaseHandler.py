from peewee import *
import logging

db = SqliteDatabase('data.db', pragmas=[('journal_mode', 'wal')])
#db = PostgresqlDatabase('d38iuetv41trek', user='trnvkztsnyjuar', password='4e3b5a3327363e1fbaf97591f4e57bab37d6de6ff5cfd2eb2b3190e8eff1b356',
#                           host='ec2-3-230-106-126.compute-1.amazonaws.com', port=5432)

#db = MySQLDatabase('LZd8IwW33W', user='LZd8IwW33W', password='8VtQCl68Hx',
#                         host='remotemysql.com', port=3306)

class BaseModel(Model):
    class Meta:
        database = db  # модель будет использовать базу данных 'people.db'

class Group(BaseModel):
    id = AutoField()
    token = TextField()
    group_id = IntegerField()
    key = TextField()
    secret = TextField()

    class Meta:
        db_table = "Groups"

class Admin(BaseModel):
    id = AutoField()
    user_id = IntegerField()
    upper = BooleanField()
    group = ForeignKeyField(Group, backref="group_admins")
    name = TextField()

    class Meta:       
        db_table = "Admins"

class Post(BaseModel):
    id = AutoField()
    post_id = IntegerField()
    expired = BooleanField()
    max = IntegerField()
    text = TextField()
    group = ForeignKeyField(Group, backref="group_posts")
    
    class Meta:
        db_table = "Posts"

class Quote(BaseModel):
    id = AutoField()
    comm_id = IntegerField()
    room = IntegerField()
    name = TextField()
    post = ForeignKeyField(Post, backref='post_quotes')

    class Meta:
        db_table = "Quotes"



def get_posts(group, query = None):
    if query is None:
        return Post.select().where(Post.group == group)
    else:
        return Post.select().where(Post.group == group).where(query)

def get_post(group, query = None):
    posts = get_posts(group, query).limit(1)
    return posts.get() if posts.count() != 0 else None

def get_quotes(post, query = None):
    if query is None:
        return Quote.select().where(Quote.post == post)
    else:
        return Quote.select().where(Quote.post == post).where(query) 

def get_quote(post, query = None):
    quotes = get_quotes(post,query).limit(1)
    return quotes.get() if quotes.count() != 0 else None

def get_admins(group, query = None):
    if query is None:    
        return Admin.select().where(Admin.group == group)
    else:
        return Admin.select().where(Admin.group == group).where(query)

def get_admin(group, query = None):
    admins = get_admins(group, query).limit(1)
    return admins.get() if admins.count() != 0 else None

def get_group(query):
    groups = Group.select().where(query).limit(1)
    return groups.get() if groups.count() != 0 else None
            