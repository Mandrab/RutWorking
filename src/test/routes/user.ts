/**
 * Tests user routes
 * 
 * @author Paolo Baldini
 */
const request = require('supertest')('http://localhost:8080')

/**********************************************************************************************************************
    LOGIN 
**********************************************************************************************************************/

request.post('/login').expect(404).end((err: any) => { if (err) console.log(err) })

request.post('/login').send({userEmail: 'john'}).expect(404).end((err: any) => { if (err) console.log(err) })

request.post('/login').send({userEmail: 'admin@admin.admin'}).expect(500)   // miss password
    .end((err: any) => { if (err) console.log(err) })

request.post('/login').send({
    userEmail: 'admin@admin.admin',
    password: 'not-correct-one'
}).expect(401).end((err: any) => { if (err) console.log(err) })

// TODO user is not active: 403

request.put('/login').expect(404).end((err: any) => { if (err) console.log(err) })
request.get('/login').expect(404).end((err: any) => { if (err) console.log(err) })
request.delete('/login').expect(404).end((err: any) => { if (err) console.log(err) })