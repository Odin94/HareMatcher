package de.odinmatthias.profiles

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.statements.api.ExposedBlob
import org.jetbrains.exposed.sql.transactions.transaction
import users.UserDAO
import users.Users
import java.time.LocalDate
import java.util.*


@Serializable
data class Profile(
    val id: Int?, val userId: Int, val name: String, val city: String, val race: String, val furColor: String,
    val age: Int, val weightInKG: Double, val description: String, val picture: String, val vaccinations: List<Vaccination>
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Profile

        if (id != other.id) return false
        if (name != other.name) return false
        if (city != other.city) return false
        if (race != other.race) return false
        if (furColor != other.furColor) return false
        if (age != other.age) return false
        if (weightInKG != other.weightInKG) return false
        if (picture != other.picture) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id ?: 0
        result = 31 * result + name.hashCode()
        result = 31 * result + city.hashCode()
        result = 31 * result + race.hashCode()
        result = 31 * result + furColor.hashCode()
        result = 31 * result + age
        result = 31 * result + weightInKG.hashCode()
        result = 31 * result + picture.hashCode()
        return result
    }
}

object Profiles : IntIdTable() {
    val name: Column<String> = varchar("name", 100)
    val user = reference("user", Users)
    val city: Column<String> = varchar("city", 100)
    val race: Column<String> = varchar("race", 100)
    val furColor: Column<String> = varchar("furColor", 100)
    val age: Column<Int> = integer("age")
    val weightInKG: Column<Double> = double("weightInKG")
    val description: Column<String> = text("description")
    val picture: Column<ExposedBlob> = blob("picture")
}

class ProfileDAO(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<ProfileDAO>(Profiles)

    var name by Profiles.name
    var user by UserDAO referencedOn Profiles.user
    var city by Profiles.city
    var race by Profiles.race
    var furColor by Profiles.furColor
    var age by Profiles.age
    var weightInKG by Profiles.weightInKG
    var description by Profiles.description
    var picture by Profiles.picture
    val vaccinations by VaccinationDAO referrersOn Vaccinations.profile

    fun toProfile() = Profile(
        id.value,
        user.id.value,
        name,
        city,
        race,
        furColor,
        age,
        weightInKG,
        description,
        Base64.getEncoder().encodeToString(picture.bytes),
        transaction { vaccinations.map { it.toVaccination() } })
}

fun createProfile(userDao: UserDAO, profileCreationData: ProfileCreationData): Profile {
    val imageBytes = if (profileCreationData.imagesBase64[0].contains(",")) {
        // split out 'data:image/png;base64,'
        Base64.getDecoder().decode(profileCreationData.imagesBase64[0].split(",")[1])
    } else {
        Base64.getDecoder().decode(profileCreationData.imagesBase64[0])
    }

    val newProfileDao = ProfileDAO.new {
        name = profileCreationData.name
        user = userDao
        city = profileCreationData.city
        race = profileCreationData.race
        furColor = profileCreationData.furColor
        age = profileCreationData.age
        weightInKG = profileCreationData.weightInKg
        description = profileCreationData.description
        picture = ExposedBlob(imageBytes)
    }

    VaccinationDAO.new {
        profile = newProfileDao
        disease = "Myxomatosis"
        date = LocalDate.of(2021, 6, 18)
    }
    VaccinationDAO.new {
        profile = newProfileDao
        disease = "RVHD"
        date = LocalDate.of(2022, 6, 3)
    }

    return newProfileDao.toProfile()
}
