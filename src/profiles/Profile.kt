package de.odinmatthias.profiles

import de.odinmatthias.matches.Swipe
import de.odinmatthias.matches.SwipeDAO
import de.odinmatthias.matches.Swipes
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
import java.time.format.DateTimeFormatter


@Serializable
data class Profile(
    val id: Int?, val userId: Int, val name: String, val city: String, val race: String, val furColor: String,
    val age: Int, val weightInKG: Double, val description: String, val profilePictures: List<ProfilePicture>,
    val vaccinations: List<Vaccination>, val receivedSwipes: List<Swipe>, val matchable: Boolean
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
    val pictures by ProfilePictureDAO referrersOn ProfilePictures.profile
    val vaccinations by VaccinationDAO referrersOn Vaccinations.profile
    val receivedSwipes by SwipeDAO referrersOn Swipes.swipedProfile

    fun toProfile(matchable: Boolean = false) = Profile(
        id.value,
        user.id.value,
        name,
        city,
        race,
        furColor,
        age,
        weightInKG,
        description,
        transaction { pictures.map { it.toProfilePicture() } },
        transaction { vaccinations.map { it.toVaccination() } },
        transaction { receivedSwipes.map { it.toSwipe() } },
        matchable
    )
}

fun createProfile(userDao: UserDAO, profileCreationData: ProfileCreationData): Profile {
    val newProfileDao = ProfileDAO.new {
        name = profileCreationData.name
        user = userDao
        city = profileCreationData.city
        race = profileCreationData.race
        furColor = profileCreationData.furColor
        age = profileCreationData.age
        weightInKG = profileCreationData.weightInKG
        description = profileCreationData.description
    }

    profileCreationData.picturesWithFormats.forEachIndexed { i, pictureWithFormat ->
        ProfilePictureDAO.new {
            profile = newProfileDao
            picture = ExposedBlob(pictureWithFormat.bytes)
            format = pictureWithFormat.format
            index = i
        }
    }

    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    profileCreationData.vaccinations.forEach {
        VaccinationDAO.new {
            profile = newProfileDao
            disease = it.disease
            date = LocalDate.parse(it.date, formatter)
        }
    }

    return newProfileDao.toProfile()
}

// Pictures and vaccinations are updated separately
fun updateProfile(existingProfile: ProfileDAO, profileUpdateData: ProfileUpdateData) {
    existingProfile.name = profileUpdateData.name
    existingProfile.city = profileUpdateData.city
    existingProfile.race = profileUpdateData.race
    existingProfile.furColor = profileUpdateData.furColor
    existingProfile.age = profileUpdateData.age
    existingProfile.weightInKG = profileUpdateData.weightInKG
    existingProfile.description = profileUpdateData.description
    existingProfile.name = profileUpdateData.name
}