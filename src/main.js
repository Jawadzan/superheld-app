import './style.css'


let heroes = [] //bewaart alle superhelden data
let filteredHeroes = [] //bevat superhelden na het filteren
let favorites = JSON.parse(localStorage.getItem('favorites')) || [] //hier gebruik ik localstorage voor favs
let showingFavorites = false //laat bijhouden of we favs of alles bekijken
let currentSort = null //houdt bij welke sorteeroptie ik heb 

//data wordt hier opgehaald van de api, async functie voor betere ophaling van data
async function loadHeroes() {
  try {
    const response = await fetch('https://akabab.github.io/superhero-api/api/all.json')
    heroes = await response.json()

    //eerste 20 helden worden weergegeven
    filteredHeroes = heroes.slice(0, 20)
    renderHeroes(filteredHeroes)
  } catch (error) { // catch error moest er een fout gebeuren
    console.error('Failed to load superheroes:', error)
  }
}

// functie die helden visueel laat zien
function renderHeroes(heroesToRender) {
  const container = document.getElementById('hero-list')
  container.innerHTML = ''

  heroesToRender.forEach(hero => {
    const card = document.createElement('div')
    card.className = 'hero-card'

    const fullName = hero.biography.fullName || 'Unknown'
    const publisher = hero.biography.publisher || 'Unknown'
    const placeOfBirth = hero.biography.placeOfBirth || 'Unknown'
    const gender = hero.appearance.gender || 'Unknown'
    const height = hero.appearance.height?.[1] || 'Unknown'
    const power = hero.powerstats.power ?? 'N/A'

    //hier checkt of held al fav is
    const isFavorited = favorites.includes(hero.id)
    const heartEmoji = isFavorited ? '❤️' : '🤍'

    card.innerHTML = `
      <h2>${hero.name}</h2>
      <img src="${hero.images.lg}" alt="${hero.name}">
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Publisher:</strong> ${publisher}</p>
      <p><strong>Place of Birth:</strong> ${placeOfBirth}</p>
      <p><strong>Gender:</strong> ${gender}</p>
      <p><strong>Height:</strong> ${height}</p>
      <p><strong>Power:</strong> ${power}</p>
      <button class="fav-btn" data-id="${hero.id}" data-favorited="${isFavorited}">${heartEmoji}</button>
    `
    container.appendChild(card)
  })

  attachFavoriteEvents()
}


function attachFavoriteEvents() {
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(btn.dataset.id)
      const isFavorited = btn.dataset.favorited === 'true'
      
      // favoriet tussen geklikt en niet
      if (isFavorited) {
        btn.textContent = '🤍'
        btn.dataset.favorited = 'false'
      } else {
        btn.textContent = '❤️'
        btn.dataset.favorited = 'true'
      }
      
    
      toggleFavorite(id)
    })
  })
}

// favoriet systeem met localStorage
function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(favId => favId !== id)
  } else {
    favorites.push(id)
  }
  localStorage.setItem('favorites', JSON.stringify(favorites))
}

//debounce functie voor betere uitvoering
function debounce(func, delay) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), delay)
  }
}

//zoekoptie met debounce
document.getElementById('search-input').addEventListener('input',
  debounce((e) => {
    const query = e.target.value.toLowerCase()
    filteredHeroes = heroes.filter(hero =>
      hero.name.toLowerCase().includes(query)
    )
    applyCurrentSort()
    if (showingFavorites) {
      renderHeroes(filteredHeroes.filter(h => favorites.includes(h.id)))
    } else {
      renderHeroes(filteredHeroes)
    }
  }, 300)
)

//filteren op uitgever
document.getElementById('filter-publisher').addEventListener('change', (e) => {
  const publisher = e.target.value
  filteredHeroes = heroes.filter(hero =>
    publisher === 'all' || hero.biography.publisher === publisher
  )
  applyCurrentSort()
  if (showingFavorites) {
    renderHeroes(filteredHeroes.filter(h => favorites.includes(h.id)))
  } else {
    renderHeroes(filteredHeroes)
  }
})

//filteren op geslacht
document.getElementById('filter-gender').addEventListener('change', (e) => {
  const gender = e.target.value
  filteredHeroes = heroes.filter(hero =>
    gender === 'all' || hero.appearance.gender === gender
  )
  applyCurrentSort()
  if (showingFavorites) {
    renderHeroes(filteredHeroes.filter(h => favorites.includes(h.id)))
  } else {
    renderHeroes(filteredHeroes)
  }
})

//sorteren op naam
document.getElementById('sort-name').addEventListener('click', () => {
  currentSort = 'name'
  const sorted = [...filteredHeroes].sort((a, b) => a.name.localeCompare(b.name))
  if (showingFavorites) {
    renderHeroes(sorted.filter(h => favorites.includes(h.id)))
  } else {
    renderHeroes(sorted)
  }
})

//sorteren op kracht
document.getElementById('sort-power').addEventListener('click', () => {
  currentSort = 'power'
  const sorted = [...filteredHeroes].sort((a, b) => {
    const powerA = a.powerstats.power ?? 0
    const powerB = b.powerstats.power ?? 0
    return powerB - powerA
  })
  if (showingFavorites) {
    renderHeroes(sorted.filter(h => favorites.includes(h.id)))
  } else {
    renderHeroes(sorted)
  }
})


function applyCurrentSort() {
  if (currentSort === 'name') {
    filteredHeroes.sort((a, b) => a.name.localeCompare(b.name))
  } else if (currentSort === 'power') {
    filteredHeroes.sort((a, b) => (b.powerstats.power ?? 0) - (a.powerstats.power ?? 0))
  }
}

//event tussen alle helden en favs
document.getElementById('toggle-favorites').addEventListener('click', () => {
  showingFavorites = !showingFavorites
  const button = document.getElementById('toggle-favorites')
  button.textContent = showingFavorites ? 'Show All' : 'Show Favorites'

  const toRender = showingFavorites
    ? filteredHeroes.filter(h => favorites.includes(h.id))
    : filteredHeroes

  renderHeroes(toRender)
})

//laat een willekeurige held zien
document.getElementById('random-hero').addEventListener('click', () => {
  const source = showingFavorites
    ? heroes.filter(h => favorites.includes(h.id))
    : heroes

  const random = source[Math.floor(Math.random() * source.length)]
  renderHeroes([random])
})

//laad helden na DOM
document.addEventListener('DOMContentLoaded', loadHeroes)