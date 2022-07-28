import { tattooXnY } from "./configFile.js"

const idSheets = '1MERztkt3mv4lQbHRVpc1iPdochBNwBwV7CXfrMKrP1o'
const apiKey = 'AIzaSyC8qom2bU-CbjLUCl_v7_4uRSrMZ1eEDIE'
const sheetValues = 'B17:B18'
const sheetUrl = "https://content-sheets.googleapis.com/v4/spreadsheets/" + idSheets + "/values/" + sheetValues + "?access_token=" + apiKey + "&key=" + apiKey

const finalPriceEl = document.getElementById("finalPrice")
//Loading text 3 dots animation
const loadingText = document.getElementById("loadingTextID")
const loadingModal = document.getElementsByClassName("app__loader")[0]
const loadingAnimation = () => {
    window.animInterval = setInterval(() => {
        if (loadingText.innerText.match("Cargando...")) loadingText.innerText = "Cargando."
        else loadingText.innerText = loadingText.innerText + "."
    }, 1200);
}
loadingAnimation()
const handleCloseLoadingAnim = () => {
    clearInterval(animInterval)
    loadingModal.style.display = "none"
}

//handle infoBasic
function handleInfoBasic(){
    const calculateExpYears = () => {
        const TATT_SINCE = 2019
        const ACTUAL_YEAR = new Date().getFullYear()
        return ACTUAL_YEAR - TATT_SINCE
    }
    document.getElementById("tattoinTime").innerHTML = String(calculateExpYears())

}


//Handle Cotization
function handleCotizar(e) {
    e.preventDefault()
    const obtainFormData = () => {
        let dataObj = {}
        for (let i = 0; i < e.target.elements.length; i++) {
            if (e.target.elements[i].value !== undefined && e.target.elements[i].value !== "") {
                if (e.target.elements[i].type === "checkbox") {
                    e.target.elements[i].checked ? e.target.elements[i].value = "true" : e.target.elements[i].value = "false"
                }
                dataObj = { ...dataObj, [e.target.elements[i].name]: e.target.elements[i].value }
            }
        }
        return dataObj
    }
    const calculatePriceCm = async (sheetValues, dataObj) => {
        //handler de los precios
        const pricePerCm = sheetValues[0][0]
        const basicAmount = sheetValues[1][0]
        const totalCm = dataObj.cmWidth * dataObj.cmHeight
        const foo = totalCm * pricePerCm
        const handleTotalCm = (totalCm) => {
           
            if (totalCm <= 50) return 100
            if (totalCm <= 100) return 10
            if (totalCm <= 200) return 6
            else return 3
        }

        let finalAmount = Math.round(foo - foo / handleTotalCm(totalCm) + Number(basicAmount))
        if (finalAmount <= 2500) finalAmount = 2500

        const finalObj = {
            insumosPrice: basicAmount,
            precioCm: pricePerCm,
            tattooCm: totalCm,
            finalPrice: String(finalAmount).slice(0, -1) + 0,
            inputCm: dataObj
        }

        return finalObj
    }
    const printData = (data) => {
        finalPriceEl.innerHTML = `Precio: $${data.finalPrice}`
        finalPriceEl.classList.add("finalPriceCheck")
        setTimeout(() => {
            finalPriceEl.classList.remove("finalPriceCheck")
        }, 2000);
        document.getElementById("tattooCotizationMsgId").innerHTML =
            `Recorda que el precio final puede variar dependiendo del diseño y su complejidad.`
        document.getElementById("tattooCotizationMoreInfoId").style.display = "grid"
        location.href = '#tattooCotizationMoreInfoId'
    }
    const obtainPrice = async () => {
        let formDataObj = obtainFormData()
        let sheetValues = await fetch(sheetUrl)
            .then((lista) => {
                return lista.json()
            }).then((valores) => {
                return valores.values
            }).catch(err => {
                console.log(err);
            })
        let cmPriceObj = await calculatePriceCm(sheetValues, formDataObj)
        printData(cmPriceObj)
    }
    obtainPrice()
}

const formEl = document.getElementById("formEl")
formEl.addEventListener("submit", handleCotizar)

//handle navbar
const navBarChangeTo = (eTarget) => {
    const handleVisibleSection = (eId) => {
        document.getElementById("mainContainerId").childNodes.forEach(element => {
            if (!element.id) return
            if (eId === element.id && element.style.display === "unset")
                element.style.display = "none"
            else eId === element.id ? element.style.display = "unset"
                : element.style.display = "none"
        });
    }
    if (eTarget.classList.contains("aRedirection")) {
        document.getElementById("navBarId").childNodes.forEach(element => {
            if (element.nodeName != "#text") {
                if (eTarget.attributes.for.value == element.attributes.for.value) {
                    element.setAttribute("navselect", "true")
                    element.style.border = "solid 2px rgb(255, 62, 62)"
                } else {
                    element.style.border = "solid 2px white"
                    element.removeAttribute("navselect")
                }
            }
        });
    }
    if (eTarget.attributes.for.value)
        handleVisibleSection(eTarget.attributes.for.value)
}
document.getElementById("navBarId").addEventListener("click", (e) => {
    if (!e.target.attributes.for) return
    e.target.attributes.navselect ?
        e.target.removeAttribute("navselect")
        :
        e.target.setAttribute("navselect", "true")
    e.target.parentNode.childNodes.forEach((element) => {
        if (element.nodeName != "#text") {
            if (e.target !== element) element.removeAttribute("navselect")
            if (!element.attributes.navselect) {
                element.style.border = "solid 2px white"
            } else {
                element.style.border = "solid 2px rgb(255, 62, 62)"
            }

        }
    })
    navBarChangeTo(e.target)
})
const aRedirect = document.querySelectorAll(".aRedirection")
for (let i = 0; i < aRedirect.length; i++) {
    aRedirect[i].addEventListener("click", (e) => {
        navBarChangeTo(e.target)
    })

}
//handler disponibilidad y lugar
const printDisponibilityState = (values) => {
    if (!values) return
    const paymentBtn = document.getElementById("paymentBtn")
    const paymentDivEl = document.getElementById("paymentSection")
    const dispElement = document.getElementById("disponibilityState")
    let message
    let date = values[1].toUpperCase()
    let sessCost = String(values[2])
    console.log(sessCost)
    console.log(values)
    if (values[0] == "TRUE") {
        console.log(values);
        message = `AGENDA ABIERTA: ${date}`
        dispElement.parentNode.classList.add("disponibilityTrue")
        paymentDivEl.innerHTML = `
        Para agendar un turno con seña por medio de Mercado Pago hace click en el botón que esta mas abajo.
        Antes de realizar el pago te recomiendo escribirme para arreglar una fecha y hablar acerca del tatuaje y 
        diseño.
        <br>
        (el valor de la seña sera descontado del valor final del tatuaje)
        <br>
        <br>
        Valor de la Seña: $${sessCost} 
        <br>
        <br>
        `
        paymentDivEl.appendChild(paymentBtn)
        paymentBtn.style.display = "unset"

    } else {
        message = `AGENDA CERRADA: ${date}`
        dispElement.parentNode.classList.add("disponibilityFalse")
        paymentDivEl.innerHTML = `
        Lo siento, actualmente la agenda para este mes se encuentra cerrada.
        <br>
        <br>
        `
        paymentBtn.style.display = "none"
    }
    dispElement.innerText = message
}
const handleDisponibility = async () => {
    fetch("https://content-sheets.googleapis.com/v4/spreadsheets/" + idSheets + "/values/B15:C16" + "?access_token=" + apiKey + "&key=" + apiKey)
        .then((lista) => {
            return lista.json()
        }).then((state) => {
        console.log(state)
        console.log(state.values)
            printDisponibilityState(state.values[0])
        }).catch(err => {
            console.log(err);
        })
}
handleDisponibility()



window.onload = () => {
    handleCloseLoadingAnim()
    handleInfoBasic()
}
