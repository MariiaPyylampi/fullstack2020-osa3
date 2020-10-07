const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')
const { request, response } = require('express')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

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

/* app.get('/info', (request, response) => {
    const people = persons.length
    console.log(people)
    const date = new Date()
    response.send(`<p>Phonebook has info for ${people} people</p>${date}`)
}) */

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ error: 'name or number missing' })
    } 
    
    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson.toJSON())
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => { 
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    if (!body.number) {
        return response.status(400).json({ error: 'number missing' })
    }

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

/* app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
}) */

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        response.status(400).send({ error: 'malformatted id'})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

