function clear_history() {
    localStorage.clear();
    document.querySelector("#watched tbody").innerHTML = "";
}

function add_result(item) {
    const results = document.querySelector("#search-results");
    if (results.innerHTML === "No results matching your query!") {
        results.innerHTML = "";
    }

    const card = document.createElement("div");
    card.classList.add("card", "d-flex", "m-3", "p-3");
    card.style.width = "100%";
    card.style.cursor = "pointer";

    const card_body = document.createElement("div");
    card_body.classList.add("card-body");

    const card_image = document.createElement("img");
    card_image.src = item.i;
    card_image.height = 150;
    card_image.width = 150;

    const card_title = document.createElement("h5");
    card_title.classList.add("card-title");
    card_title.innerHTML = item.l + ` (${item.y})`;

    const card_type = document.createElement("h6");
    card_type.classList.add("card-title-secondary");
    card_type.innerHTML = item.q === "feature" ? "Movie" : item.q;

    const card_text = document.createElement("p");
    card_text.classList.add("card-text");
    card_text.innerHTML = item.s;

    const card_id = document.createElement("p");
    card_id.classList.add("card-link");
    card_id.innerHTML = `IMDb ID: ${item.id}`;

    card.appendChild(card_image);
    card_body.append(card_title, card_type, card_text, card_id);
    card.appendChild(card_body);
    card.addEventListener("click", () => {
        document.querySelector("#id").value = item.id;
        window.scrollTo(0, 0);
    });

    results.appendChild(card);
}

function search() {
    let q = document.querySelector("#q_field").value.replaceAll(" ", "_");
    const results_list = document.querySelector("#search-results");
    jQuery.ajax({
        url: `https://sg.media-imdb.com/suggests/f/${q}.json`,
        dataType: "jsonp",
        cache: true,
        jsonp: false,
        jsonpCallback: `imdb$${q}`,
    }).then((results) => {
        results_list.innerHTML = "No results matching your query!";
        results.d.forEach((item) => {
            if (item.id.startsWith("tt")) {
                add_result(item);
            }
        });
    });
}

function get_iframe() {
    const iframe = document.querySelector("iframe");
    const id = document.querySelector("#id").value;
    const season = document.querySelector("#season").value;
    const episode = document.querySelector("#episode").value;

    iframe.src = season && episode
        ? `https://multiembed.mov/?video_id=${id}&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${id}`;

    jQuery.ajax({
        url: `https://sg.media-imdb.com/suggests/f/${id}.json`,
        dataType: "jsonp",
        cache: true,
        jsonp: false,
        jsonpCallback: `imdb$${id}`,
    }).then((results) => {
        const item = results.d.find((i) => i.id.startsWith("tt"));
        const title = item.l;
        const watched = JSON.parse(localStorage.getItem("watched") || "[]");

        watched.push({ id, title, season, episode });
        localStorage.setItem("watched", JSON.stringify(watched));
        update_watched();
        document.querySelector("title").innerHTML = `Streaming  - ${title}`;
    });

    history.pushState({}, null, `?id=${id}&s=${season}&e=${episode}`);
    iframe.scrollIntoView();
}

function update_watched() {
    const watched = JSON.parse(localStorage.getItem("watched") || "[]");
    const table = document.querySelector("tbody");
    table.innerHTML = "";

    watched.reverse().forEach((item) => {
        const row = document.createElement("tr");
        row.dataset.href = `?id=${item.id}&s=${item.season}&e=${item.episode}`;
        row.style.cursor = "pointer";

        ["id", "title", "season", "episode"].forEach((key) => {
            const cell = document.createElement("td");
            cell.innerHTML = item[key];
            row.appendChild(cell);
        });

        row.addEventListener("click", () => {
            window.location.href = row.dataset.href;
        });

        table.appendChild(row);
    });
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("id")) {
    document.querySelector("#id").value = urlParams.get("id");
    document.querySelector("#season").value = urlParams.get("s");
    document.querySelector("#episode").value = urlParams.get("e");
    get_iframe();
}

update_watched();

