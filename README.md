# Classfetch

This is a quick react app I threw together to see the classes, even if the admins removed access. This works because the API doesn't get restricted. Nice job classlink devs.


## How it works:

Ordinarily, you can see your classes from the classlink dashboard, but the Admins decided to disable that. Thankfully, I had the foresight to document how it fetches classes and handles authentication, so with a hacky little userscript, some super simple javascript, and a CORS proxy, I am able to fetch the class list.

Let's go into some more detail ;)

### Authentication

The authentication flow for classlink is as follows:

1. Upon login you are provided a code, this is usually around 30 characters and starts with a c.
2. Using the endpoint at `https://applications.apis.classlink.com/exchangeCode`, you can send a `GET` request with the `code` parameter. This looks like `https://applications.apis.classlink.com/exchangeCode?code=c1234567890123456789012345678901234567890&response_type=code`.
3. If this is successful you get an access token, which can be used to get information from various endpoints, like `https://myclasses.apis.classlink.com/v1/classes`, with the header: `Authorization: Bearer <ACCESS_TOKEN>`.





