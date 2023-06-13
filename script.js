// Set your Spotify Client ID and Client Secret
const clientId = 'YOUR_CLIENT_ID';
const clientSecret = 'YOUR_CLIENT_SECRET';
const redirectUri = 'YOUR_REDIRECT_URI';

// Function to authenticate the user with Spotify
function authenticateUser() {
  const scopes = 'user-read-recently-played'; // Requested scopes
  const authorizeUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  window.location.href = authorizeUrl;
}

// Function to handle the callback after user authentication
function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const authorizationCode = urlParams.get('code');

  if (authorizationCode) {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const bodyParams = new URLSearchParams();
    bodyParams.append('grant_type', 'authorization_code');
    bodyParams.append('code', authorizationCode);
    bodyParams.append('redirect_uri', redirectUri);

    fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: bodyParams
    })
    .then(response => response.json())
    .then(data => {
      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;

      // Store the access token and refresh token securely for future use
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Continue with accessing the user's recently played tracks
      getRecentlyPlayedTracks(accessToken);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
}

// Function to get the user's recently played tracks
function getRecentlyPlayedTracks(accessToken) {
  const recentlyPlayedUrl = 'https://api.spotify.com/v1/me/player/recently-played';

  fetch(recentlyPlayedUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    // Display the last played song
    const lastPlayedSong = data.items[0].track.name;
    document.getElementById('lastPlayedSong').textContent = `Last Played Song: ${lastPlayedSong}`;
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

// Function to log out the user
function logOutUser() {
  // Clear the stored access token and refresh token
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  // Redirect to the initial page or perform any other logout logic
  window.location.href = 'spotify_integration.html';
}

// Check if the user is already authorized
const accessToken = localStorage.getItem('accessToken');

if (accessToken) {
  // User is already authorized
  document.getElementById('connectButton').style.display = 'none';
  document.getElementById('showLastSongButton').style.display = 'block';
  document.getElementById('logOutButton').style.display = 'block';
} else {
  // User is not authorized
  document.getElementById('connectButton').style.display = 'block';
  document.getElementById('showLastSongButton').style.display = 'none';
  document.getElementById('logOutButton').style.display = 'none';
}

// Add event listeners
document.getElementById('connectButton').addEventListener('click', authenticateUser);
document.getElementById('showLastSongButton').addEventListener('click', () => {
  const accessToken = localStorage.getItem('accessToken');
  getRecentlyPlayedTracks(accessToken);
});
document.getElementById('logOutButton').addEventListener('click', logOutUser);

// Call the handleCallback function on the callback page after Spotify authentication
handleCallback();