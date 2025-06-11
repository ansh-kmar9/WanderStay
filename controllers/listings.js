const Listing = require("../models/listing");
const geocodeLocation = require("../utils/geocode");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({})
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showListing = async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  function getCategoryIcon(category) {
    const icons = {
      Home: "fas fa-home",
      Hotel: "fas fa-hotel",
      Beach: "fas fa-umbrella-beach",
      Mountain: "fas fa-mountain",
      Pool: "fas fa-swimming-pool",
      Apartment: "fas fa-building",
      Farm: "fas fa-tractor",
      default: "fas fa-home",
    };

    return icons[category] || icons.default;
  }

  if (!listing) {
    req.flash("error", "Listing you requested for does not exists!");
    return res.redirect("/listings");
  }
  res.render("listings/show", { listing, getCategoryIcon });
};

module.exports.listByCategory = async (req, res) => {
  const { category } = req.params;
  const validCategories = [
    "Home",
    "Hotel",
    "Beach",
    "Mountain",
    "Pool",
    "Apartment",
    "Farm",
  ];

  if (!validCategories.includes(category)) {
    req.flash("error", "Invalid category.");
    return res.redirect("/listings");
  }

  const listings = await Listing.find({ category });

  res.render("listings/category", { listings, category });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);

  const coordinates = await geocodeLocation(newListing.location);
  if (!coordinates) {
    req.flash("error", "Invalid location. Could not geocode.");
    return res.redirect("/listings/new");
  }
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = {
    type: "Point",
    coordinates: [coordinates.lng, coordinates.lat],
  };

  if (newListing) {
    await newListing.save();
  }

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit", { listing, originalImageUrl });
};

module.exports.renderReserve = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists!");
    return res.redirect("/listings");
  }

  res.render("listings/reserve", {
    listing,
    stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }

  await listing.save();
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.handlePayment = async (req, res) => {
  const listingId = req.params.id;
  const listing = await Listing.findById(listingId);
  const { amount, checkIn, checkOut, guests } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "link"],
    mode: "payment",
    client_reference_id: `${listingId}:${amount}:${checkIn}:${checkOut}:${guests}`,
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: listing.title,
            description: `Stay at ${listing.title} in ${listing.location}`,
            images: [listing.image.url],
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/listings/${listingId}/reserve/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.protocol}://${req.get(
      "host"
    )}/listings/${listingId}/reserve/cancel`,
  });

  res.json({ id: session.id });
};

module.exports.renderSuccessPaymentPage = async (req, res) => {
  const sessionId = req.query.session_id;

  if (!sessionId) {
    req.flash("error", "Session ID not provided");
    return res.redirect("/listings");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const [listingId, amount, checkIn, checkOut, guests] =
    session.client_reference_id.split(":");

  const listing = await Listing.findById(listingId);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  req.flash(
    "success",
    "Congratulations! Your room has been booked successfully."
  );
  res.render("payments/success", {
    listing,
    amount,
    checkIn,
    checkOut,
    guests,
  });
};

module.exports.renderCancelPaymentPage = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  req.flash(
    "error",
    "Booking was cancelled. Please try again or select another room."
  );
  res.render("payments/cancel", { listing });
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
