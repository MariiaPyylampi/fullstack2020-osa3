const { request, response } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

const requestLogger = (request, response, next) => {
    console.log('---')
    console.log('Method:', request.method)
    console.log('Path:', request.path)
    console.log('Body:', request.body)
    console.log('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint'})
}

app.use(requestLogger)

morgan.token('body', function (req, res) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


let persons = [
    {
        id: 1,
        name: "Arto Hellas", 
        number: "040-123456",
    },
    { 
        id: 2,
        name: "Ada Lovelace", 
        number: "39-44-5323523", 
    },
    { 
        id: 3,
        name: "Dan Abramov", 
        number: "12-43-234345",
    },
    { 
        id: 4,
        name: "Mary Poppendieck", 
        number: "39-23-6423122",
    }
]
  
app.get('/', (request, response) => {
    response.send('<h1>Welcome to Phonebook!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const people = persons.length
    console.log(people)
    const date = new Date()
    response.send(`<p>Phonebook has info for ${people} people</p>${date}`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    } else if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name already exists in the phonebook'
        })
    }
    
    const randomId = Math.floor(Math.random() * Math.floor(1000))
    
    const person = {
        id: randomId,
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    response.json(person)
})

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

