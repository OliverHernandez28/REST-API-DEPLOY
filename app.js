const express = require('express');
const crypto = require('node:crypto');
const movies = require('./movies.json');
const { validateMovie, validatePartialMovie } = require('./schemas/movies');

const app = express();
app.disable('x-powered-by');

app.use(express.json());


// Todos los recursos que sean movies se identifica con /movies
app.get('/movies', (req, res) => {
    let origenes = ['https://la-bodega-del-licor.netlify.app/', 'http://127.0.0.1:5500'];

    //res.header('Access-Control-Allow-Origin', '*');
    //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    if (origenes.includes(req.headers.origin) || !req.headers.origin)
        res.header('Access-Control-Allow-Origin', req.headers.origin);
    const { genre } = req.query;
    if (genre) {
        const filteredMovies = movies.filter(
            m => m.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        );

        if (filteredMovies.length > 0) return res.json(filteredMovies);

        return res.status(404).json({
            message: 'Movies  not found'
        })
    }

    res.json(movies)
})

app.get('/movies/:id', (req, res) => {
    const { id } = req.params;
    const movie = movies.find(m => m.id === id);
    if (movie) return res.json(movie);

    res.status(404).json({
        message: 'Movie not found'
    })

})

app.post('/movies', (req, res) => {

    const result = validateMovie(req.body);
    if (result.error) return res.status(400).json({
        message: JSON.parse(result.error.message)
    })

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }

    movies.push(newMovie)
    res.status(201).json(newMovie)

})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body);
    console.log(result);
    if (result.error) return res.status(400).json({
        message: JSON.parse(result.error.message)
    })
    const { id } = req.params;
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex === -1) return res.status(404).json({
        message: 'Movie not found'
    })

    const updatedMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updatedMovie;
    res.json(updatedMovie)

})

app.options('/movies/:id', (req, res) => {
    let origenes = ['https://la-bodega-del-licor.netlify.app/', 'http://127.0.0.1:5500'];

    if (origenes.includes(req.headers.origin) || !req.headers.origin) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    }
    res.send(); // Asegura terminar el flujo
});


app.delete('/movies/:id', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    const { id } = req.params;
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex === -1) {
        return res.status(404).json({
            message: 'Movie not found'
        });
    }
    movies.splice(movieIndex, 1);
    res.sendStatus(204)
})

app.use((req, res) => {
    res.status(404);
    res.end('<h1 style="color:red">404 Not Found</h1>');
})


const port = process.env.PORT || 1234;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})





