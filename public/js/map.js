function initMap() {
  const listingLocation = {
    lat: 25.7848, // Latitude for Patna
    lng: 84.7274, // Longitude for Patna
  };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: listingLocation,
  });

  new google.maps.Marker({
    position: listingLocation,
    map: map,
    icon: {
      url: "https://imgs.search.brave.com/0CWSh5GoS1qI1F1gZXt-FyBU75FfKrlHcDIkhgaipTE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4w/Lmljb25maW5kZXIu/Y29tL2RhdGEvaWNv/bnMva2lycmtsZS1t/YXBzLWFuZC1uYXZp/Z2F0aW9uLzYwLzAy/Xy1fSG9tZV9tYXBf/bWFya2VyLTUxMi5w/bmc",
      scaledSize: new google.maps.Size(40, 40),
    },
  });
}
