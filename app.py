from flask import Flask, render_template, jsonify, session

app = Flask(__name__)
app.secret_key = "dev-secret-key-change-in-production"

# Hardcoded product catalog — no database needed for this assignment.
products = [
    {
        "id": 1,
        "name": "Garage Racing Oversized Tee",
        "category": "tshirts",
        "gender": "Unisex",
        "price": 3000,
        "images": ["garage-racing-tee.jpg"],
    },
    {
        "id": 2,
        "name": "Leaf Print Wrap Frock",
        "category": "frocks",
        "gender": "Women",
        "price": 3500,
        "images": ["leaf-dress-ruby.jpg", "leaf-dress-meadow.jpg"],
        "colors": ["Ruby", "Meadow"],
    },
    {
        "id": 3,
        "name": "Pink Panther Boba Tee",
        "category": "tshirts",
        "gender": "Unisex",
        "price": 3000,
        "images": ["pink-panther-tee.jpg"],
    },
    {
        "id": 4,
        "name": "Ruby Lips Back-Print Tee",
        "category": "tshirts",
        "gender": "Unisex",
        "price": 3000,
        "images": ["ruby-lips-tee-1.jpg", "ruby-lips-tee-2.jpg"],
    },
    {
        "id": 5,
        "name": "Samnish Classic Logo Tee",
        "category": "tshirts",
        "gender": "Men",
        "price": 3000,
        "images": ["samnish-logo-tee.jpg"],
    },
    {
        "id": 6,
        "name": "Pug Life Oversized Tee",
        "category": "tshirts",
        "gender": "Unisex",
        "price": 3000,
        "images": ["pug-life-tee.jpg"],
    },
]

CATEGORY_META = {
    "tshirts": "T-Shirts",
    "frocks": "Frocks",
}
GENDERS = ["Men", "Women", "Unisex"]


def get_cart():
    return session.setdefault("cart", {})


@app.route("/")
def storefront():
    cart = get_cart()
    cart_count = sum(cart.values())
    return render_template(
        "storefront.html",
        products=products,
        categories=CATEGORY_META,
        genders=GENDERS,
        cart_count=cart_count,
    )


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/cart", methods=["GET"])
def view_cart():
    cart = get_cart()
    items = []
    total = 0
    for pid_str, qty in cart.items():
        product = next((p for p in products if p["id"] == int(pid_str)), None)
        if product:
            line_total = product["price"] * qty
            total += line_total
            items.append({**product, "qty": qty, "line_total": line_total})
    return jsonify({"items": items, "total": total, "count": sum(cart.values())})


@app.route("/api/cart/add/<int:product_id>", methods=["POST"])
def add_to_cart(product_id):
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    cart = get_cart()
    key = str(product_id)
    cart[key] = cart.get(key, 0) + 1
    session.modified = True

    return jsonify({"product": product["name"], "count": sum(cart.values())})


@app.route("/api/cart/clear", methods=["POST"])
def clear_cart():
    session["cart"] = {}
    return jsonify({"status": "cleared"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
