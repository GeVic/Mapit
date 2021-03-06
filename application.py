from flask import Flask, jsonify, render_template, request, url_for
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker 
import os
import re
from helpers import lookup
import json

# creating flask object
app = Flask(__name__)

# configure sql_alchemy
engine = create_engine(os.getenv('DATABASE_URL'))
db = scoped_session(sessionmaker(bind=engine))

# for 
def alchemyencoder(obj):
    """JSON encoder function for SQLAlchemy special classes."""
    if isinstance(obj, datetime.date):
        return obj.isoformat()
    elif isinstance(obj, decimal.Decimal):
        return float(obj)

# to ensure the responses aren't cached (stored)
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


# route the default page
@app.route('/')
def index():
    # to render map
    if not os.environ.get("API_KEY"):
        raise RuntimeError("API_KEY not set")
    return render_template("index.html", key=os.environ.get("API_KEY"))

@app.route("/articles")
def articles():
    """Look up articles for geo"""
    query = request.args.get("geo")

    # validate location
    if not query:
        raise RuntimeError("Location is not specified")
    # to get parsed rss feeds
    articles = lookup(query)

    # get 5 articles
    if len(articles) > 5:
        #return jsonify(articles[:5])
        return json.dumps([dict(articles[r]) for r in range(5)],default=alchemyencoder)
    else:
        #return jsonify(articles)
        return json.dumps([dict(r) for r in articles],default=alchemyencoder)


@app.route("/search")
def search():
    """Search for places that match query"""
    # Raise exception if no args is passed
    if not request.args.get('q'):
        raise RuntimeError("missing query")
    # % is the SQL's wild card which here help
    q = request.args.get("q") + "%"
    places = db.execute("SELECT * FROM places WHERE postal_code LIKE :q OR place_name LIKE :q", {'q': q}).fetchall()
    if len(places) > 10:
        #return jsonify(places[:10])
        return json.dumps([dict(places[r]) for r in range(10)],default=alchemyencoder)
    else:
        #return jsonify(places)
        return json.dumps([dict(r) for r in places],default=alchemyencoder)


@app.route("/update")
def update():
    """Find up to 10 places within view"""
    # Ensure parameters are present
    if not request.args.get("sw"):
        raise RuntimeError("missing sw")
    if not request.args.get("ne"):
        raise RuntimeError("missing ne")

    # Ensure parameters are in lat,lng format
    if not re.search("^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$", request.args.get("sw")):
        raise RuntimeError("invalid sw")
    if not re.search("^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$", request.args.get("ne")):
        raise RuntimeError("invalid ne")

    # Explode southwest corner into two variables
    sw_lat, sw_lng = map(float, request.args.get("sw").split(","))

    # Explode northeast corner into two variables
    ne_lat, ne_lng = map(float, request.args.get("ne").split(","))

    # Find 10 cities within view, pseudorandomly choosen if more within view
    if sw_lng <= ne_lng:

        # Doesn't cross the antimeridian
        rows = db.execute("""SELECT * FROM places
                          WHERE :sw_lat <= latitude AND latitude <= :ne_lat AND (:sw_lng <= longitude AND longitude <= :ne_lng)
                          GROUP BY country_code, place_name, admin_code1
                          ORDER BY RANDOM()
                          LIMIT 10""",
                          {'sw_lat': sw_lat, 'ne_lat': ne_lat, 'sw_lng': sw_lng, 'ne_lng': ne_lng}).fetchall()

    else:

        # Crosses the antimeridian
        rows = db.execute("""SELECT * FROM places
                          WHERE :sw_lat <= latitude AND latitude <= :ne_lat AND (:sw_lng <= longitude OR longitude <= :ne_lng)
                          GROUP BY country_code, place_name, admin_code1
                          ORDER BY RANDOM()
                          LIMIT 10""",
                          {'sw_lat': sw_lat, 'ne_lat': ne_lat, 'sw_lng': sw_lng, 'ne_lng': ne_lng}).fetchall()

    # Output places as JSON
    #return jsonify(rows)
    return json.dumps([dict(r) for r in rows],default=alchemyencoder)
