package de.odinmatthias

import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.transaction
import java.sql.Connection


class DatabaseConnector() {
    init {
        connect()
        createSchema()
    }

    private fun connect() {
        Database.connect("jdbc:sqlite:/database/db.sqlite", "org.sqlite.JDBC")
        TransactionManager.manager.defaultIsolationLevel = Connection.TRANSACTION_SERIALIZABLE
    }

    private fun createSchema() {
        transaction {
//            SchemaUtils.create(Users)
//            SchemaUtils.create(Matches)
//
//            Images.deleteAll()
        }
    }

    suspend fun <T> dbQuery(block: () -> T): T =
        transaction { block() }
}