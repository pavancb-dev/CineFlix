import { useState, useEffect } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";

const API_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchterm, setDebouncedSearchterm] = useState('');

  useDebounce(() => setDebouncedSearchterm(searchTerm), 500, [searchTerm]);

  const [popularMovieList, setPopularMovieList] = useState([]);
  const [errorMessage1, setErrorMessage1] = useState("");
  const [isLoading1, setLoading1] = useState(false);

  const fetchPopularMovies = async () => {
    try {
      setLoading1(true)
      setErrorMessage1('')
      const endpoint = `${API_URL}/trending/movie/day`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Failed to fetch popular movies');
      }
      const data = await response.json();
      if (data.Response === 'False') {
        setErrorMessage1(data.Error || "Failed to popular fetch movies. Please reload");
        setPopularMovieList([]);
        return;
      }
      setPopularMovieList(data.results || []);
    } catch(error) {
      console.error(`Error fetching popular movies : ${error}`);
      setErrorMessage1("Failed to fetch popular movies. Please Reload");
    } finally {
      setLoading1(false)
    }
  }

  useEffect(() => {fetchPopularMovies()}, []);

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setLoading] = useState(false);

  const fetchMovies = async (query) => {
    try {
      setLoading(true)
      setErrorMessage('')
      const endpoint = query ? `${API_URL}/search/movie?query=${encodeURIComponent(query)}` : `${API_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();
      if (data.Response === 'False') {
        setErrorMessage(data.Error || "Failed to fetch movies. Please try again later.");
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);
    } catch (error) {
      console.error(`Error fetching movies : ${error}`);
      setErrorMessage("Failed to fetch movies. Please try again later.");
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {fetchMovies(debouncedSearchterm)}, [debouncedSearchterm]);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without The Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <section className="trending">
          <h2>Treding Movies</h2>
          <ul>
            {popularMovieList.slice(0, 5).map(((movie, index) => (
                <li key={index}>
                  <p>{index + 1}</p>
                  <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`|| '/no-movie.png'} alt={movie.title} />
                </li>
              )))}
          </ul>
        </section>

        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (<Spinner/>) : 
          errorMessage ? (<p className="text-red-500">{errorMessage}</p>) :
          (
            <ul>{movieList.map(movie => (<MovieCard key={movie.id} movie={movie}/>))}</ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
