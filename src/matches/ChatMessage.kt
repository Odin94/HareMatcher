package de.odinmatthias.matches

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
class ChatMessage(val id: Int?, val message: String, val sourceUserId: Int, val targetUserId: Int, val sentOn: String) {
    companion object {
        val chatMessageDateTimeFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")
    }
}


object ChatMessages : IntIdTable() {
    val message: Column<String> = text("message")
    val sourceUser = reference("sourceUser", Users)
    val targetUser = reference("targetUser", Users)
    val sentOn: Column<LocalDateTime> = datetime("createdOn")
}

class ChatMessageDAO(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<ChatMessageDAO>(ChatMessages)

    var message by ChatMessages.message
    var sourceUser by UserDAO referencedOn ChatMessages.sourceUser
    var targetUser by UserDAO referencedOn ChatMessages.targetUser
    var sentOn by ChatMessages.sentOn

    fun toChatMessage() = ChatMessage(
        id.value,
        message,
        sourceUser.id.value,
        targetUser.id.value,
        sentOn.format(ChatMessage.chatMessageDateTimeFormatter)
    )
}
