require('dotenv').config()
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const nightmare = require('nightmare')()

//passing in arguments for different products
const args = process.argv.slice(2)
const url = args[0]
const minPrice = args[1]

checkPrice()

async function checkPrice() {
  try {
    const priceString = await nightmare
      .goto(url)
      .wait('#priceblock_ourprice')
      .evaluate(() => document.getElementById('priceblock_ourprice').innerText)
      .end()

    //parse the string into a particular price
    const priceNumber = parseFloat(priceString.replace('$', ''))
    if (priceNumber < minPrice) {
      await sendEmail(
        'Price is Low ',
        `The price on ${url} has dropped below ${minPrice}`,
      )
    }
  } catch (e) {
    await sendEmail('Amazon Price Checker Error', e.message)
    throw e
  }
}

function sendEmail(subject, body) {
  const email = {
    to: 'hlela.maqoqa@gmail.com',
    from: 'amazonza-price-checker@outlook.com',
    subject: subject,
    text: body,
    html: body,
  }
  return sgMail.send(email)
}
