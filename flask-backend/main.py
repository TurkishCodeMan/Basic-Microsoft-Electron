from flask import Flask, request,redirect,session,url_for,jsonify
from flask_cors import CORS
import msal
import uuid
from database.database import Database  # database paketinden Database sınıfını al
from database.user import User


azure_client_id = "fb13a8c7-145c-4d90-95c5-f4e27d2727ee"
azure_client_id2='34568dbe-e199-4390-9b66-062503a88674'
azure_secret = "556cff1a-b1d7-44bc-a6e7-df7bcaee5ffe"
azure_secret2='d63d8219-3bd0-459d-80bc-8a89970178c6'
azure_kiracı = "f8cdef31-a31e-4b4a-93e4-5f571e91255a"
azure_kiracı2 = "0d36bc18-438a-4b0f-88d6-967f3c060c8e"
AUTHORITY = "https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a"

app = Flask(__name__)
CORS(app, origins="*")
app.config['SECRET_KEY'] = 'hsyn'

# Microsoft Identity Platform'a bir istemci (client) oluştur
msal_app = msal.ConfidentialClientApplication(
    azure_client_id, authority=AUTHORITY, client_credential=azure_secret
)


SCOPE = ["email"]

database = Database('users.json')

@app.route('/login')
def login():
    # Oturum başlat
    session['state'] = str(uuid.uuid4())
    auth_url = msal_app.get_authorization_request_url(
        scopes=SCOPE, state=session['state'], redirect_uri='https://www.office.com/?auth=1')
    print(auth_url)
   
    return {"redirect_url":'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=4765445b-32c6-49b0-83e6-1d93765276ca&redirect_uri=https%3A%2F%2Fwww.office.com%2Flandingv2&response_type=code%20id_token&scope=openid%20profile%20https%3A%2F%2Fwww.office.com%2Fv2%2FOfficeHome.All&response_mode=form_post&nonce=638437813288524365.NTQ3NTAwMTMtNzg0OS00N2I1LTgxYzgtMGM5NzhjYjE3M2UxZDU2NjQ2NWMtYWMyNy00ZWJjLTlmYjYtZGYxODRmODJkYzhk&ui_locales=tr-TR&mkt=tr-TR&prompt=select_account&client-request-id=ad28bd14-58d2-45d9-a02d-57b0c251ed55&state=cqc-typOe9Azpc-bbglCCZriMRwSxfbej_MveCs3i7wkZYuaGtHnnqVlVlGDkL9Ux8UbJMML-zDx9HDncRlQ9JtqovTymRgwG0k6YUsLkrrsLGnHG2tKcZH6j7YKQLoFkoMS6_on7hwW3wI45rWPmwJXccfcgYXT7pkDBvwWCxvv6SexGFa8o7p9ZZyT38Q2OMxrAXvJj4IRsW9oyb2zycW_mNluUFfV8gMIYcRMIt9laqkmzMK7ipCNvnFDer_QwHO12nSbO2US_yhpufpen2Npw42pQdSGpCgYR2QL5Fql41fKA72-GPbcEjO4zU6vyfa0eGkmZA3JK5kU1gMv2vLfrSJSe0Bk520gqoSKGX1QH2LZn4X-JYDGfw4pGy93&x-client-SKU=ID_NET6_0&x-client-ver=6.34.0.0'}


@app.route('/get_users', methods=['GET'])
def get_users():
    try:
        users = database.get_all_users()  # Veritabanından tüm kullanıcıları al
        print(users)
        return jsonify(users), 200  # Kullanıcıları JSON formatında döndür
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Hata durumunda hata mesajını JSON formatında döndü

@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.json
    try:
        new_user = User(data['name'], data['email'], data['password'])
        database.add_user(new_user)
        return jsonify({'message': 'User added successfully'}), 200
    except KeyError as e:
        return jsonify({'error': f'Missing required field: {e}'}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400


if __name__ == "__main__":
    app.run(port=5000, debug=True)
