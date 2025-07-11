```toml
name = 'Login OFFICER'
method = 'POST'
url = 'http://localhost:3000/api/auth/login'
sortWeight = 2000000
id = '1dee8637-c178-49bd-a971-7ae02efc11db'

[auth]
type = 'NO_AUTH'

[body]
type = 'JSON'
raw = '''
{
  "email":"judyta.buczkowski@example.com",
"password":"Pass@123"
}'''
```
