package de.odinmatthias.matches

import de.odinmatthias.profiles.ProfileDAO
import de.odinmatthias.profiles.Profiles
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.`java-time`.datetime
import users.UserDAO
import users.Users
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter


@Serializable
data class Swipe(
    val id: Int?,
    val userId: Int,
    val swipedProfileId: Int,
    val createdOn: String,
    val likeOrPass: LikeOrPass
)

object Swipes : IntIdTable() {
    val user = reference("user", Users)
    val swipedProfile = reference("swipedProfile", Profiles)
    val createdOn: Column<LocalDateTime> = datetime("createdOn")
    val likeOrPass: Column<LikeOrPass> = enumerationByName("likeOrPass", 4, LikeOrPass::class)
}

class SwipeDAO(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<SwipeDAO>(Swipes)

    var user by UserDAO referencedOn Swipes.user
    var swipedProfile by ProfileDAO referencedOn Swipes.swipedProfile
    var createdOn by Swipes.createdOn
    var likeOrPass by Swipes.likeOrPass

    fun toSwipe() = Swipe(
        id.value,
        user.id.value,
        swipedProfile.id.value,
        createdOn.format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")),
        likeOrPass
    )
}

enum class LikeOrPass {
    LIKE, PASS
}