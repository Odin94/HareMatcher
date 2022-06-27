package de.odinmatthias.profiles

import de.odinmatthias.PictureFormat
import de.odinmatthias.PictureUtils
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.statements.api.ExposedBlob


@Serializable
data class ProfilePicture(val id: Int?, val profileId: Int, val picture: String, val index: Int)

object ProfilePictures : IntIdTable() {
    val profile = reference("profile", Profiles)
    val picture: Column<ExposedBlob> = blob("picture")
    val format: Column<PictureFormat> = enumerationByName("format", 12, PictureFormat::class)
    val index: Column<Int> = integer("index")
}

class ProfilePictureDAO(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<ProfilePictureDAO>(ProfilePictures)

    var profile by ProfileDAO referencedOn ProfilePictures.profile
    var picture by ProfilePictures.picture
    var format by ProfilePictures.format
    var index by ProfilePictures.index

    fun toProfilePicture() = ProfilePicture(
        id.value,
        profile.id.value,
        PictureUtils.base64Encode(picture.bytes, format),
        index
    )
}
