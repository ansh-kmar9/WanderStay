const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  //--- index/listing route
  .get(wrapAsync(listingController.index))
  //--- create route
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,

    wrapAsync(listingController.createListing)
  );

//--- new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//---category route
router.get("/category/:category", listingController.listByCategory);

router
  .route("/:id")
  //--- show route
  .get(wrapAsync(listingController.showListing))

  //--- update route
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,

    wrapAsync(listingController.updateListing)
  )
  //--- delete route
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//--- edit route
router.get(
  "/:id/edit",
  isOwner,
  isLoggedIn,
  wrapAsync(listingController.renderEditForm)
);

router.get(
  "/:id/reserve",
  isLoggedIn,
  wrapAsync(listingController.renderReserve)
);

// POST /listings/:id/create-checkout-session
router.post(
  "/:id/create-checkout-session",
  isLoggedIn,
  wrapAsync(listingController.handlePayment)
);

// --- payment success route
router.get(
  "/:id/reserve/success",
  isLoggedIn,
  wrapAsync(listingController.renderSuccessPaymentPage)
);

// --- payment cancel route
router.get(
  "/:id/reserve/cancel",
  isLoggedIn,
  wrapAsync(listingController.renderCancelPaymentPage)
);

module.exports = router;
