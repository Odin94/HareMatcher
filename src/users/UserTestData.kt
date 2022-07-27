package de.odinmatthias.users

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.util.*
import kotlinx.coroutines.runBlocking
import kotlin.random.Random


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

fun getRandomName() = nameOptions[Random.nextInt(0, nameOptions.size - 1)]

fun getRandomUserAttribute() = userAttributeOptions[Random.nextInt(0, userAttributeOptions.size - 1)]

fun getRandomHobbyIntro() = userHobbyIntroOptions[Random.nextInt(0, userHobbyIntroOptions.size - 1)]

fun getRandomHobby() = userHobbyOptions[Random.nextInt(0, userHobbyOptions.size - 1)]

// TODO: This is pretty slow, maybe just download once and keep in file system?
fun getRandomProfilePicture(): ByteArray {
    // see here https://unsplash.com/documentation
    val url = Url("https://source.unsplash.com/random/?face&w=800&fm=jpg")

    val client = HttpClient(CIO)

    val imageBytes = runBlocking {
        val response: HttpResponse = client.get(url)
        return@runBlocking response.content.toByteArray()
    }

    return imageBytes
}