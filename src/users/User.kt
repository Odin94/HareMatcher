package users

import de.odinmatthias.PictureFormat
import de.odinmatthias.PictureUtils
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
import org.jetbrains.exposed.sql.statements.api.ExposedBlob

@Serializable
data class User(
    val id: Int?,
    val name: String,
    val email: String,
    val description: String,
    val picture: String,
    val profileIds: List<Int>,
    val givenSwipeIds: List<Int>,
    val isMe: Boolean
)

object Users : IntIdTable() {
    val email: Column<String> = varchar("email", 320).uniqueIndex()
    val name: Column<String> = varchar("name", 100)
    val description: Column<String> = text("description")
    val hashedPassword: Column<ByteArray> = binary("hashPassword", 512)
    val picture: Column<ExposedBlob> = blob("picture")
    val pictureFormat: Column<PictureFormat> = enumerationByName("pictureFormat", 12, PictureFormat::class)
}

class UserDAO(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<UserDAO>(Users)

    var email by Users.email
    var name by Users.name
    var description by Users.description
    var hashedPassword by Users.hashedPassword
    var picture by Users.picture
    var pictureFormat by Users.pictureFormat
    val profiles by ProfileDAO referrersOn Profiles.user
    val givenSwipes by SwipeDAO referrersOn Swipes.user

    fun toUser(isMe: Boolean = false) = User(
        this@UserDAO.id.value,
        name,
        email,
        description,
        PictureUtils.base64Encode(picture.bytes, pictureFormat),
        profiles.map { it.id.value },
        givenSwipes.map { it.id.value },
        isMe
    )
}
