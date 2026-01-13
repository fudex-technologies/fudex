export const FAQ_QUESTIONS_AND_ANSWERS = [
    {
        id: 1,
        question: "How do I place an order on FUDEX?",
        answer: "Browse restaurants, add items to your cart, and checkout. Once your payment is confirmed, we’ll start preparing and delivering your order.",
        group: "Orders & Delivery"
    },
    {
        id: 2,
        question: "How long does delivery take?",
        answer: "Yes. After placing your order, you can track it directly in the app. You’ll see when the restaurant starts preparing your food, when it’s picked up by the rider, and when it’s close to your location.",
        group: "Orders & Delivery"
    },
    {
        id: 3,
        question: "What if my order is delayed?",
        answer: "If there’s a delay, we’ll notify you in the app. You can also contact support if your order takes longer than expected.",
        group: "Orders & Delivery"
    },
    {
        id: 4,
        question: "What payment methods does FUDEX accept?",
        answer: "You can pay using your FUDEX wallet or a debit card.",
        group: "Payment & Fees"
    },
    {
        id: 5,
        question: "What is the FUDEX wallet and how does it work?",
        answer: "The FUDEX wallet is where your food credits and refunds are stored. You can use your wallet balance to pay for orders, and any earned referral rewards or refunds will be added there automatically.",
        group: "Payment & Fees"
    },
    {
        id: 6,
        question: "Is it safe to save my card on FUDEX?",
        answer: "Yes. Your card details are protected using secure encryption. FUDEX does not store sensitive information like your card PIN or CVV, and payments are processed through trusted payment partners.",
        group: "Payment & Fees"
    },
    {
        id: 7,
        question: "Why am I charged a delivery fee?",
        answer: "The delivery fee covers the cost of transporting your food from the restaurant to your location. This includes rider availability, distance, and location. Delivery fees may vary, but you’ll always see the exact amount before completing your order.",
        group: "Payment & Fees"
    },
    {
        id: 8,
        question: "What is the service charge and why do I pay it?",
        answer: "The service charge helps FUDEX operate and improve the platform. It supports things like app maintenance, customer support, and tools that help restaurants and riders serve you better. This fee is clearly shown during checkout.",
        group: "Payment & Fees"
    },
    {
        id: 9,
        question: "Can delivery and service charges change?",
        answer: "Yes. Delivery and service charges may vary depending on your location, order size, or current demand. Any applicable fees are displayed before payment, so you can review them before confirming your order.",
        group: "Payment & Fees"
    },
    {
        id: 10,
        question: "How do referral rewards work?",
        answer: "When you share your referral code with 5 people and they sign up on FUDEX using it, you earn food credits. These credits are added to your FUDEX wallet and can be used to pay for future orders.",
        group: "Promo Codes & Referrals"
    },
    {
        id: 11,
        question: "When will I receive my referral food credits?",
        answer: "Your food credits are added to your wallet once your friends successfully complete signup on FUDEX. You’ll be notified in the app when the credits are available.",
        group: "Promo Codes & Referrals"
    },
    {
        id: 12,
        question: "Can I cancel my order after placing it?",
        answer: "Order cancellation depends on whether the restaurant has started preparing your food. If cancellation is available, you’ll see the option in the app. If not, you can contact support for assistance.",
        group: "Account & Support"
    },

    {
        id: 13,
        question: "What if I receive the wrong or damaged order?",
        answer: "If there’s an issue with your order, contact customer support through the app as soon as possible. We’ll review the situation and work with the restaurant to resolve it quickly.",
        group: "Account & Support"
    },
]

type FAQ = {
    id: number
    question: string
    answer: string
    group: string
}


export const groupFAQs = (faqs: FAQ[]): Record<string, Array<FAQ>> => {
    return faqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
        if (!acc[faq.group]) {
            acc[faq.group] = []
        }
        acc[faq.group].push(faq)
        return acc
    }, {})
}