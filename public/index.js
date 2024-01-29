require("@babel/polyfill");
var $90BYH$axios = require("axios");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
/* eslint-disable */ 
/* eslint-disable */ const $513f768c51ede170$export$4c5dd147b21b9176 = (locations)=>{
    mapboxgl.accessToken = "ADD YOURS HERE";
    var map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy",
        scrollZoom: false
    });
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((loc)=>{
        // Create marker
        const el = document.createElement("div");
        el.className = "marker";
        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: "bottom"
        }).setLngLat(loc.coordinates).addTo(map);
        // Add popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
};


/* eslint-disable */ 
/* eslint-disable */ const $c707d6ee37bde2f6$export$516836c6a9dfc573 = ()=>{
    const el = document.querySelector(".alert");
    if (el) el.parentElement.removeChild(el);
};
const $c707d6ee37bde2f6$export$de026b00723010c1 = (type, msg, time = 7)=>{
    $c707d6ee37bde2f6$export$516836c6a9dfc573();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
    window.setTimeout($c707d6ee37bde2f6$export$516836c6a9dfc573, time * 1000);
};


const $f6de1f61f547a0b0$export$596d806903d1f59e = async (email, password)=>{
    try {
        const res = await (0, ($parcel$interopDefault($90BYH$axios)))({
            method: "POST",
            url: "/api/v1/users/login",
            data: {
                email: email,
                password: password
            }
        });
        if (res.data.status === "success") {
            (0, $c707d6ee37bde2f6$export$de026b00723010c1)("success", "Logged in successfully!");
            window.setTimeout(()=>{
                location.assign("/");
            }, 1500);
        }
    } catch (err) {
        (0, $c707d6ee37bde2f6$export$de026b00723010c1)("error", err.response.data.message);
    }
};
const $f6de1f61f547a0b0$export$a0973bcfe11b05c9 = async ()=>{
    try {
        const res = await (0, ($parcel$interopDefault($90BYH$axios)))({
            method: "GET",
            url: "/api/v1/users/logout"
        });
        res.data.status = "success";
        location.reload(true);
    } catch (err) {
        console.log(err.response);
        (0, $c707d6ee37bde2f6$export$de026b00723010c1)("error", "Error logging out! Try again.");
    }
};


/* eslint-disable */ 

const $aa2e469459d27961$export$f558026a994b6051 = async (data, type)=>{
    try {
        const url = type === "password" ? "/api/v1/users/updateMyPassword" : "/api/v1/users/updateMe";
        const res = await (0, ($parcel$interopDefault($90BYH$axios)))({
            method: "PATCH",
            url: url,
            data: data
        });
        if (res.data.status === "success") (0, $c707d6ee37bde2f6$export$de026b00723010c1)("success", `${type.toUpperCase()} updated successfully!`);
    } catch (err) {
        (0, $c707d6ee37bde2f6$export$de026b00723010c1)("error", err.response.data.message);
    }
};


/* eslint-disable */ 

const $7a9535cd9beb3362$var$stripe = Stripe("ADD YOURS HERE");
const $7a9535cd9beb3362$export$8d5bdbf26681c0c2 = async (tourId)=>{
    try {
        // 1) Get checkout session from API
        const session = await (0, ($parcel$interopDefault($90BYH$axios)))(`/api/v1/bookings/checkout-session/${tourId}`);
        // console.log(session);
        // 2) Create checkout form + chanre credit card
        await $7a9535cd9beb3362$var$stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        console.log(err);
        (0, $c707d6ee37bde2f6$export$de026b00723010c1)("error", err);
    }
};



// DOM ELEMENTS
const $ef7802436eb993da$var$mapBox = document.getElementById("map");
const $ef7802436eb993da$var$loginForm = document.querySelector(".form--login");
const $ef7802436eb993da$var$logOutBtn = document.querySelector(".nav__el--logout");
const $ef7802436eb993da$var$userDataForm = document.querySelector(".form-user-data");
const $ef7802436eb993da$var$userPasswordForm = document.querySelector(".form-user-password");
const $ef7802436eb993da$var$bookBtn = document.getElementById("book-tour");
// DELEGATION
if ($ef7802436eb993da$var$mapBox) {
    const locations = JSON.parse($ef7802436eb993da$var$mapBox.dataset.locations);
    (0, $513f768c51ede170$export$4c5dd147b21b9176)(locations);
}
if ($ef7802436eb993da$var$loginForm) $ef7802436eb993da$var$loginForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    (0, $f6de1f61f547a0b0$export$596d806903d1f59e)(email, password);
});
if ($ef7802436eb993da$var$logOutBtn) $ef7802436eb993da$var$logOutBtn.addEventListener("click", (0, $f6de1f61f547a0b0$export$a0973bcfe11b05c9));
if ($ef7802436eb993da$var$userDataForm) $ef7802436eb993da$var$userDataForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);
    (0, $aa2e469459d27961$export$f558026a994b6051)(form, "data");
});
if ($ef7802436eb993da$var$userPasswordForm) $ef7802436eb993da$var$userPasswordForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating...";
    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await (0, $aa2e469459d27961$export$f558026a994b6051)({
        passwordCurrent: passwordCurrent,
        password: password,
        passwordConfirm: passwordConfirm
    }, "password");
    document.querySelector(".btn--save-password").textContent = "Save password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
});
if ($ef7802436eb993da$var$bookBtn) $ef7802436eb993da$var$bookBtn.addEventListener("click", (e)=>{
    e.target.textContent = "Processing...";
    const { tourId: tourId } = e.target.dataset;
    (0, $7a9535cd9beb3362$export$8d5bdbf26681c0c2)(tourId);
});
const $ef7802436eb993da$var$alertMessage = document.querySelector("body").dataset.alert;
if ($ef7802436eb993da$var$alertMessage) (0, $c707d6ee37bde2f6$export$de026b00723010c1)("success", $ef7802436eb993da$var$alertMessage, 20);


