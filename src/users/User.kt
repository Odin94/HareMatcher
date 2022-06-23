package users

import de.odinmatthias.matches.SwipeDAO
import de.odinmatthias.matches.Swipes
import de.odinmatthias.profiles.ProfileDAO
import de.odinmatthias.profiles.Profiles
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column

@Serializable
data class User(
    val id: Int?,
    val name: String,
    val email: String,
    val profileIds: List<Int>,
    val givenSwipeIds: List<Int>,
    val isMe: Boolean
)

object Users : IntIdTable() {
    val email: Column<String> = varchar("email", 320)
    val name: Column<String> = varchar("name", 100)
    val hashedPassword: Column<ByteArray> = binary("hashPassword", 512)
}

class UserDAO(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<UserDAO>(Users)

    var email by Users.email
    var name by Users.name
    var hashedPassword by Users.hashedPassword
    val profiles by ProfileDAO referrersOn Profiles.user
    val givenSwipes by SwipeDAO referrersOn Swipes.user

    fun toUser(isMe: Boolean = false) = User(this@UserDAO.id.value, name, email, profiles.map { it.id.value }, givenSwipes.map { it.id.value }, isMe)
}
