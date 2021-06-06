package users

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column

@Serializable
data class User(val id: Int?, val name: String, val email: String)

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
}