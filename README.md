# Showcase GQL

A GraphQL API for creating and exploring CodeDay projects/teams.

## Security

Showcase makes use of [JSON Web Tokens (JWT)](https://jwt.io/) to provide stateless authentication. To authenticate
with the API, set the `Authorization` or `X-Showcase-Authorization` header to a `Bearer` JWT token.
(e.g. `X-Showcase-Authorization: Bearer {token}`)

The token should meet the following requirements:

- `alg`: HS256, HS384, HS512
- `key`: The value of the `JWT_SECRET` environment variable (ask the ops team)
- `aud`: The value of the `JWT_AUDIENCE` environment variable (default showcase)

The payload may contain the following:

- `a` ("admin", **required**): If true, the user can edit, feature, and award all projects in the specified `e`.
- `u` ("username", optional): For newly created projects, and allows editing all the user's projects.
- `e` ("eventId", optional): For newly created projects (if null, cannot create any); admin event scope if `a`.
- `g` ("eventGroupId", optional): For newly created projects (if null cannot create any), only used for discovery.
- `r` ("regionId", optional): For newly created projects, only used for discovery.
- `p` ("programId", optional): For newly created projects, only used for discovery.

### Example Payloads

A token allowing an end-user to create projects in the specified event:

```json
{
  "a": false,
  "u": "johnpeter",
  "p": "codeday",
  "r": "seattle",
  "g": "winter-2020",
  "e": "codeday-seattle-winter-2020"
}
```

A token allowing an end-user to create projects, with required information only. (Note that the un-populated information
will **not** be inferred -- that is, even if other events were created with the same `e`, but with `p`/`r`/`g` set, this
project will still have all other fields set to `null`. Put another way: make sure to populate all the information
applicable to the event.)

```json
{
  "a": false,
  "u": "johnpeter",
  "p": "virtual",
  "e": "virtual-codeday-spring-2020"
}
```

A token allowing an end-user to edit their existing projects only, and not create new ones:

```json
{
  "a": false,
  "u": "johnpeter"
}
```

An admin token allowing editing all events in a region, giving awards, etc:

```json
{
  "a": true,
  "e": "codeday-seattle-spring-2020"
}
```
