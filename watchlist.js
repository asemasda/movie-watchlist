document.addEventListener("DOMContentLoaded", () => {
    const movieContainer = document.getElementById("movie-container");
    const mainContainer = document.getElementById("main-container");

    renderWatchlist();

    movieContainer.addEventListener("click", function(event) {
        const removeBtn = event.target.closest(".remove-btn");
        const readMoreBtn = event.target.closest(".read-more");

        if (removeBtn) {
            const movieElement = removeBtn.closest(".movie-display");
            const imdbId = movieElement.dataset.imdbId;
            removeFromWatchlist(imdbId, movieElement);
        } else if (readMoreBtn) {
            const movieElement = readMoreBtn.closest(".movie-display");
            const imdbId = movieElement.dataset.imdbId;
            const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
            const fullPlot = watchlist.find(m => m.imdbId === imdbId).plot;
            readMoreBtn.previousSibling.textContent = fullPlot;
            readMoreBtn.remove();
        }
    });
});

function renderWatchlist() {
    const movieContainer = document.getElementById("movie-container");
    const mainContainer = document.getElementById("main-container");
    let watchlist;
    try {
        watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    } catch (e) {
        console.error("Error parsing watchlist:", e);
        watchlist = [];
        localStorage.setItem("watchlist", "[]");
    }

    const fragment = document.createDocumentFragment();
    movieContainer.innerHTML = '';

    if (watchlist.length === 0) {
        mainContainer.style.display = "block";
    } else {
        mainContainer.style.display = "none";
        watchlist.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.className = 'movie-display';
            movieElement.dataset.imdbId = movie.imdbId;

            const plot = movie.plot.length > 100 ? movie.plot.substring(0, 100) + '...' : movie.plot;
            const readMore = movie.plot.length > 100 ? '<button class="read-more">Read More</button>' : '';

            movieElement.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}" class="image-poster" loading="lazy">
                <div class="text-continer">
                    <h2 class="movie-title">${movie.title} 
                        <span class="rating-movie">
                            <img src="./image/start-icon.png"> ${movie.rating || 'N/A'}
                        </span>
                    </h2>
                    <p class="text-type"> 
                        ${movie.runtime || 'N/A'} <span>${movie.genre || 'N/A'}</span> 
                        <button class="remove-btn"><img src="./image/remove-icon.png"> Remove</button>
                    </p>
                    <p class="text-plot">${plot} ${readMore}</p>
                    <p class="border-bottom"></p>
                </div>
            `;

            fragment.appendChild(movieElement);
        });
        movieContainer.appendChild(fragment);
    }
}

function removeFromWatchlist(imdbId, movieElement) {
    const mainContainer = document.getElementById("main-container");
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    const updatedWatchlist = watchlist.filter(item => item.imdbId !== imdbId);

    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
    movieElement.style.opacity = '0';
    setTimeout(() => {
        movieElement.remove();
        if (updatedWatchlist.length === 0) {
            mainContainer.style.display = "block";
        }
    }, 300);
}