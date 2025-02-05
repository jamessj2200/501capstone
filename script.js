document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    localStorage.setItem(email, JSON.stringify({ username, password }));
    alert('Sign Up Successful!');
    this.reset();
});

document.getElementById('signin-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const storedUser = JSON.parse(localStorage.getItem(email));
    if (storedUser && storedUser.password === password) {
        alert(`Welcome back, ${storedUser.username}!`);
        document.getElementById('auth').style.display = 'none';
        document.getElementById('scheduler').style.display = 'block';
    } else {
        alert('Invalid email or password.');
    }
    this.reset();
});

document.getElementById('event-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const sportName = document.getElementById('sport-name').value;
    const eventDate = document.getElementById('event-date').value;
    const eventTime = document.getElementById('event-time').value;
    const eventItem = document.createElement('li');
    eventItem.textContent = `${sportName} - ${eventDate} at ${eventTime}`;
    document.getElementById('event-list').appendChild(eventItem);
    this.reset();
});
