package de.odinmatthias.users

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.util.*
import kotlinx.coroutines.runBlocking


val userAttributeOptions = listOf(
    "loving husband",
    "father of two",
    "mother of three",
    "adventurer",
    "coffee-lover",
    "book club organizer",
    "ASMR artist",
    "bunny-bro",
    "communist",
    "feminist",
    "vegan btw",
    "arch linux enthusiast",
    "sandwich aficionado",
    "dog trainer",
    "cat lover",
    "LGBT+",
    "neuro-a-typical",
    "a minor"
)
val userHobbyIntroOptions = listOf("I really love", "I deeply enjoy", "My favorite things to do are", "In my free time I like", "I would die without")
val userHobbyOptions = listOf(
    "reading books", "caring for bunnies", "going for runs", "making ASMR videos", "hanging out with friends",
    "watching the latest Netflix shows", "building robots", "cycling", "arts & crafts", "cooking vegan food", "playing video games", "traveling the world",
    "shopping for clothes", "listening to punk rock", "hiking in the mountains", "watching birds near the lake"
)
val nameOptions = listOf(
    "Liam",
    "Noah",
    "Oliver",
    "Elijah",
    "James",
    "William",
    "Benjamin",
    "Lucas",
    "Henry",
    "Theodore",
    "Odin",
    "Max",
    "Thomas",
    "Jakob",
    "Jonas",
    "Niklas",
    "Fred",
    "George",
    "Harry",
    "Ron",
    "Olivia",
    "Emma",
    "Charlotte",
    "Amelia",
    "Ava",
    "Sofia",
    "Isabella",
    "Mia",
    "Evelyn",
    "Harper",
    "Imogen",
    "Katy",
    "Limda",
    "Rafa",
    "Frederike",
    "Wilhelmine",
    "Minerva",
    "Cassiopeia",
    "Ariadne",
    "Svenja"
)

fun getRandomName() = nameOptions.random()

fun getRandomUserAttribute() = userAttributeOptions.random()

fun getRandomHobbyIntro() = userHobbyIntroOptions.random()

fun getRandomHobby() = userHobbyOptions.random()

fun getRandomCity() = listOf(
    "Frankfurt",
    "Munich",
    "Cologne",
    "Hamburg",
    "Stuttgart",
    "Berlin",
    "Dresden",
    "Bremen",
    "Leipzig",
    "Dortmund",
    "Erfurt",
    "Duisburg",
    "Chemnitz",
    "Mannheim"
).random()

fun getRandomFurColor() = listOf("Black", "White", "Grey", "Brown", "Chestnut", "Lynx", "Otter", "Seal", "Tan", "Chocolate").random()

fun getRandomRace() = listOf(
    "Flemish Giant",
    "Holland Lop",
    "Mini Lop",
    "Dutch",
    "Lionhead",
    "French Lop",
    "Californian",
    "Dwarf Papillon",
    "Netherland Dwarf",
    "Mini Rex",
    "Harlequin"
).random()

fun getRandomUserPicture(): ByteArray {
    // see here https://unsplash.com/documentation
    val url = Url("https://source.unsplash.com/random/?face&w=800&fm=jpg")

    val client = HttpClient(CIO)

    val imageBytes = runBlocking {
        val response: HttpResponse = client.get(url)
        return@runBlocking response.content.toByteArray()
    }

    return imageBytes
}