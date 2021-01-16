const colors = [["red", "white"], ["orange", "black"], ["yellow", "black"], ["green", "white"], ["blue", "white"], ["indigo", "white"], ["violet", "black"]]

document.getElementById('modals').addEventListener('click', () => {
  document.getElementById('modals').style.display='none'
})

function hydrate() {
  fetch('/api/list')
  .then(res => res.json())
  .then(json => {
    const cards = document.getElementById('cards')
    cards.textContent=''
    const modals = document.getElementById('modals')
    modals.textContent=''
    cards.classList.add('cards')
    json.forEach((v, i) => {
      {
        const modal = document.createElement('div')
        const title = document.createElement('h2')
        const url = document.createElement('a')
        const urlHeading = document.createElement('h3')
        const email = document.createElement('span')
        const username = document.createElement('span')
        const password = document.createElement('span')
        const deleteBtn = document.createElement('button')
        const closeBtn = document.createElement('span')
        closeBtn.classList.add('closeBtn')
        const addBr = () => modal.appendChild(document.createElement('br'))
        closeBtn.textContent='\u00D7'
        closeBtn.addEventListener('click', () => {
          modal.style.display='none'
          document.getElementById('modals').style.display = 'none'
        })
        modal.appendChild(closeBtn)
        modal.id = v.name.replace(/s+/, '-')
        modal.classList.add('modal')
        title.textContent = v.name
        title.classList.add('title')
        modal.appendChild(title)
        url.href = v.url
        urlHeading.textContent = v.url
        url.appendChild(urlHeading)
        url.classList.add('url')
        if (v.url) modal.appendChild(url)
        email.textContent = `Email: ${v.email}`
        email.classList.add('email')
        if (v.email) {
          modal.appendChild(email)
          addBr()
        }
        username.classList.add('username')
        username.textContent = `Username: ${v.username}`
        if (v.username) {
          modal.appendChild(username)
          addBr()
        }
        password.textContent= `Password: ${v.password}`
        password.classList.add('password')
        if (v.password) {
          modal.appendChild(password)
          addBr()
        }
        modal.style.backgroundColor = colors[i % colors.length][0]
        modal.style.color = colors[i % colors.length][1]
        deleteBtn.textContent='DELETE'
        deleteBtn.addEventListener('click', () => {
          if (confirm('Are you sure you would like to say bye bye?')) {
            fetch('/api/delete', {
              method: 'post',
              body: JSON.stringify({
                name: v.name
              }),
              headers: {
                'Content-Type': 'application/json'
              }
            })
              .then((res) => res.text())
              .then((res) => {
                if (res !== 'done') {
                  alert(res)
                }
              })
              .then(() => hydrate())  
          }
        })
        modal.appendChild(deleteBtn)
        addBr()
        modals.appendChild(modal)  
      }
      {
        const modal = document.createElement('div')
        const title = document.createElement('h2')
        const url = document.createElement('a')
        const urlHeading = document.createElement('h3')
        const addBr = () => modal.appendChild(document.createElement('br'))
        title.textContent = v.name
        title.classList.add('title')
        modal.appendChild(title)
        url.href = v.url
        urlHeading.textContent = v.url
        url.appendChild(urlHeading)
        url.classList.add('url')
        modal.appendChild(url)
        modal.classList.add('card')
        modal.style.backgroundColor = colors[i % colors.length][0]
        modal.style.color = colors[i % colors.length][1]
        modal.onclick = () => {
          console.log('hi')
          document.getElementById(v.name.replace(/s+/, '-')).style.display = 'block'
          document.getElementById('modals').style.display = 'block'
        }
        addBr()
        cards.appendChild(modal)  
      }
    })
  })
}
hydrate()

document.getElementById('newForm').addEventListener('submit', (event) => {
  event.preventDefault()

  fetch('/api/new', {
    method: 'post',
    body: JSON.stringify({
      name: event.target.elements.name.value,
      url: event.target.elements.url.value,
      email: event.target.elements.email.value,
      username: event.target.elements.username.value,
      password: event.target.elements.password.value
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.text())
    .then((res) => {
      if (res !== 'done') {
        alert(res)
      } else {
        hydrate()
      }
    })

  return false;
})