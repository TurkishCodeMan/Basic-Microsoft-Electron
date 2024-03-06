import json
from database.user import User


class Database:
    def __init__(self, file_path):
        self.file_path = file_path
        self.users = []
        self.load_from_file()

    def add_user(self, user):
        if user.email and user.password:
            self.users.append(user)
            self.save_to_file()
        else:
            raise ValueError("Email and password are required")

    def save_to_file(self):
        with open(self.file_path, 'w') as file:
            json.dump({"users": [user.to_dict() for user in self.users]}, file, indent=2)

    def load_from_file(self):
        try:
            with open(self.file_path, 'r') as file:
                data = json.load(file)
                if isinstance(data.get("users", []), list):
                    self.users = [User(**user_data) for user_data in data.get("users", [])]
                else:
                    raise ValueError("Invalid data format")
        except FileNotFoundError:
            pass

    def get_all_users(self):
        return [user.to_dict() for user in self.users]
