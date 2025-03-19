const btn = document.getElementById("btnSearch");
const searchPlaceholder = document.getElementById("search");
const mainContainer = document.getElementById("main-container");
const watchlistPage = document.getElementById("watchlist-Page");
const movieContainer = document.getElementById("movie-container");

watchlistPage.addEventListener('click', () => {
    window.location.href = "watchlist.html";
});


btn.addEventListener("click", () => {
    searchMovie();
});


movieContainer.addEventListener("click", function(event) {
    const watchlistBtn = event.target.closest(".watchlist-btn");
    const readMoreBtn = event.target.closest(".read-more");

    if (watchlistBtn && !watchlistBtn.disabled) {
        const movieElement = watchlistBtn.closest(".movie-display");
        const imdbId = movieElement.dataset.imdbId;
        watchlistBtn.disabled = true;
        watchlistBtn.innerHTML = '<img class="plus-icon" src="./image/plus-icon.png"> Added';

        const title = movieElement.querySelector(".movie-title").textContent.split('★')[0].trim();
        const poster = movieElement.querySelector(".image-poster").src;
        const rating = movieElement.querySelector(".rating-movie").textContent.trim().replace('★', '').trim();
        const runtimeAndGenre = movieElement.querySelector(".text-type").textContent.split('Watchlist')[0].trim();
        const runtime = runtimeAndGenre.split(' ')[0];
        const genre = runtimeAndGenre.substring(runtime.length).trim();
        const plot = movieElement.querySelector(".text-plot").textContent;

        const movieData = {
            title: title,
            imdbId: imdbId,
            poster: poster,
            rating: rating,
            runtime: runtime,
            genre: genre,
            plot: plot
        };

        let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
        if (!watchlist.some(item => item.imdbId === movieData.imdbId)) {
            watchlist.push(movieData);
            localStorage.setItem("watchlist", JSON.stringify(watchlist));
        }
    } else if (readMoreBtn) {
        const movieElement = readMoreBtn.closest(".movie-display");
        const imdbId = movieElement.dataset.imdbId;
        const fullPlot = JSON.parse(localStorage.getItem(`movie_${imdbId}`)).Plot;
        readMoreBtn.previousSibling.textContent = fullPlot;
        readMoreBtn.remove();
    }
});

async function searchMovie() {
    let query = searchPlaceholder.value.trim();
    if (!query) return;

    const cacheKey = `search_${query}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        mainContainer.style.display = "none";
        movieContainer.innerHTML = '';
        renderMovies(JSON.parse(cached));
        return;
    }

    mainContainer.style.display = "none";
    movieContainer.innerHTML = '<div class="spinner">Searching for movies...</div>';

    try {
        const searchResponse = await fetch(`http://www.omdbapi.com/?s=${query}&apikey=8dffb9ae`);
        const searchData = await searchResponse.json();

        movieContainer.innerHTML = '';

        if (searchData.Response === "True") {
            const moviePromises = searchData.Search.map(movie =>
                fetch(`http://www.omdbapi.com/?i=${movie.imdbID}&apikey=8dffb9ae`)
                    .then(response => response.json())
            );
            const moviesDetails = await Promise.all(moviePromises);
            localStorage.setItem(cacheKey, JSON.stringify(moviesDetails));
            moviesDetails.forEach(movie => localStorage.setItem(`movie_${movie.imdbID}`, JSON.stringify(movie)));
            renderMovies(moviesDetails);
        } else {
            movieContainer.innerHTML = `
                <div class="no-results">
                    <p>Unable to find what you're looking for. Please try another search.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error searching movies:", error);
        movieContainer.innerHTML = "<p>Error searching for movies. Please try again.</p>";
    }
}

function renderMovies(moviesDetails) {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    const fragment = document.createDocumentFragment();

    movieContainer.innerHTML = '';

    moviesDetails.forEach(details => {
        const isInWatchlist = watchlist.some(item => item.imdbId === details.imdbID);
        const movieElement = document.createElement('div');
        movieElement.className = 'movie-display';
        movieElement.dataset.imdbId = details.imdbID;

        const plot = details.Plot.length > 100 ? details.Plot.substring(0, 100) + '...' : details.Plot;
        const readMore = details.Plot.length > 100 ? '<button class="read-more">Read More</button>' : '';

        movieElement.innerHTML = `
            <img src="${details.Poster !== "N/A" ? details.Poster : './image/no-poster.png'}" 
                alt="${details.Title}" class="image-poster" loading="lazy">
            <div class="text-continer">
                <h2 class="movie-title">${details.Title} 
                    <span class="rating-movie">
                        <img src="./image/start-icon.png"> ${details.imdbRating}
                    </span>
                </h2> 
                <p class="text-type">
                    ${details.Runtime} <span>${details.Genre}</span>
                    <button class="watchlist-btn" ${isInWatchlist ? 'disabled' : ''}>
                        <img class="plus-icon" src="./image/plus-icon.png">
                        ${isInWatchlist ? 'Added' : 'Watchlist'}
                    </button>
                </p>
                <p class="text-plot">${plot} ${readMore}</p>
                <p class="border-bottom"></p>
            </div>
        `;

        fragment.appendChild(movieElement);
    });

    movieContainer.appendChild(fragment);
}