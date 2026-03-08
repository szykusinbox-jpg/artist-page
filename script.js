const gallery = document.getElementById("gallery");
const filter = document.getElementById("filter");

let paintings = [];
let currentLang = 'en';

const translations = {
    en: {
        artistName: "Artist Name",
        bio: "Contemporary painter exploring emotion, abstraction and landscapes.",
        instagram: "Instagram",
        facebook: "Facebook",
        mailMe: "Mail Me",
        filterAll: "All paintings",
        filterAvailable: "Available",
        filterSold: "Sold",
        statusAvailable: "Available",
        statusSold: "Sold",
        contactBtn: "Contact about this",
        inquirySubject: "Painting inquiry:"
    },
    pl: {
        artistName: "Imię Artysty", /* or keep original if it's a specific name, assuming placeholder */
        bio: "Współczesny malarz eksplorujący emocje, abstrakcję i pejzaże.",
        instagram: "Instagram",
        facebook: "Facebook",
        mailMe: "Napisz do mnie",
        filterAll: "Wszystkie obrazy",
        filterAvailable: "Dostępne",
        filterSold: "Sprzedane",
        statusAvailable: "Dostępny",
        statusSold: "Sprzedany",
        contactBtn: "Zapytaj o ten obraz",
        inquirySubject: "Zapytanie o obraz:"
    }
};

function updateTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });

    renderGallery();
}

/* GOOGLE SHEET CSV LINK */

const DATA_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjurs-Zjo2lfF6AlUZW-QL2GZ6Ahn61at8wCf2Y2ET9rI99A5C_WWYpBO59hsVvRLDNF3asK2niyfR/pub?output=csv"

    /* CSV PARSER */

function parseCSV(text) {

    const rows = text.split("\n");
    const result = [];

    for (let i = 1; i < rows.length; i++) {

        const row = rows[i].trim();
        if (!row)
            continue;

        const matches = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

        const clean = matches.map(v => v.replace(/"/g, ""));

        result.push({
            image: clean[0],
            title: clean[1],
            width: clean[2],
            height: clean[3],
            price: clean[4],
            available: clean[5]
        });

    }

    return result;

}

/* LOAD DATA */

async function loadPaintings() {

    const response = await fetch(DATA_URL);

    const text = await response.text();

    paintings = parseCSV(text);

    /* Sort available first */

    paintings.sort((a, b) => {

        return (b.available === "yes") - (a.available === "yes");

    });

    renderGallery();

}

/* RENDER */

function renderGallery() {

    gallery.innerHTML = "";

    const mode = filter.value;

    paintings.forEach(p => {

        if (mode === "available" && p.available !== "yes")
            return;
        if (mode === "sold" && p.available !== "no")
            return;

        const div = document.createElement("div");

        div.className = "painting";

        if (p.available === "no")
            div.classList.add("sold");

        div.innerHTML = `

<img loading="lazy"
src="images/${p.image}"
data-title="${p.title}"
data-size="${p.width}×${p.height}"
data-price="${p.price}">

<div class="meta">

<h3>${p.title}</h3>

<p>${p.width} cm × ${p.height} cm</p>

<p class="price">${p.price} PLN</p>

<p class="${p.available === "yes" ? "available" : "sold"}">
${p.available === "yes" ? translations[currentLang].statusAvailable : translations[currentLang].statusSold}
</p>

<a class="contactBtn"
href="mailto:artist@email.com?subject=${encodeURIComponent(translations[currentLang].inquirySubject + ' ' + p.title)}">

${translations[currentLang].contactBtn}

</a>

</div>
`;

        gallery.appendChild(div);

    });

}

/* FILTER */

filter.addEventListener("change", renderGallery);

/* LANGUAGE SWITCHER */

document.querySelectorAll('.flag').forEach(flag => {
    flag.addEventListener('click', (e) => {
        currentLang = e.target.getAttribute('data-lang');
        document.querySelectorAll('.flag').forEach(f => f.classList.remove('active'));
        e.target.classList.add('active');
        updateTranslations();
    });
});

/* MODAL VIEW */

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalInfo = document.getElementById("modalInfo");
const closeModal = document.getElementById("closeModal");

gallery.addEventListener("click", (e) => {

    if (e.target.tagName === "IMG") {

        modal.style.display = "block";

        modalImg.src = e.target.src;

        modalInfo.innerHTML = `
<h2>${e.target.dataset.title}</h2>
<p>${e.target.dataset.size} cm</p>
<p>${e.target.dataset.price} PLN</p>
`;

    }

});

closeModal.onclick = () => {
    modal.style.display = "none";
};

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
};

loadPaintings();
