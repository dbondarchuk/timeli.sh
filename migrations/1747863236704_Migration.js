const { ObjectId } = require("mongodb");

function groupAppointments(appointments) {
  const parent = {};
  const find = (x) => {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  };

  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  };

  // 1. Assign every unique email/phone its own parent
  for (const appointment of appointments) {
    if (appointment.fields.email)
      parent[appointment.fields.email] = appointment.fields.email;
    if (appointment.fields.phone)
      parent[appointment.fields.phone] = appointment.fields.phone;
  }

  // 2. Union email and phone for each appointment
  for (const appointment of appointments) {
    if (appointment.fields.email && appointment.fields.phone) {
      union(appointment.fields.email, appointment.fields.phone);
    }
  }

  // 3. Group appointments by root identifier
  const groups = {};
  for (const appointment of appointments) {
    const key =
      appointment.fields.email && parent[appointment.fields.email]
        ? find(appointment.fields.email)
        : appointment.fields.phone && parent[appointment.fields.phone]
          ? find(appointment.fields.phone)
          : undefined;

    if (!key) continue;

    if (!groups[key]) groups[key] = [];
    groups[key].push(appointment);
  }

  return Object.values(groups);
}

module.exports = {
  async up(db) {
    const appointmentsCollection = db.collection("appointments");
    const collection = db.collection("customers");

    const customers = [];
    const appointments = await appointmentsCollection.find().toArray();

    const groups = groupAppointments(appointments);

    for (const appointments of groups) {
      const appointmentsIds = appointments.map((app) => app._id);
      const known = appointments.reduce(
        (map, app) => {
          map.names.add(app.fields.name.trim());
          map.emails.add(app.fields.email.trim());
          map.phones.add(app.fields.phone.trim());

          return map;
        },
        {
          names: new Set(),
          emails: new Set(),
          phones: new Set(),
        },
      );

      const [name, ...knownNames] = known.names;
      const [email, ...knownEmails] = known.emails;
      const [phone, ...knownPhones] = known.phones;

      const customer = {
        _id: new ObjectId().toString(),
        name,
        email,
        phone,
        knownEmails,
        knownNames,
        knownPhones,
      };

      customers.push(customer);

      await appointmentsCollection.updateMany(
        {
          _id: {
            $in: appointmentsIds,
          },
        },
        {
          $set: {
            customerId: customer._id,
          },
        },
      );
    }

    if (customers.length) {
      await collection.insertMany(customers);
    }
  },

  async down(db) {
    await db.dropCollection("customers");

    await db.collection("appointments").updateMany(
      {},
      {
        $unset: {
          customerId: 1,
        },
      },
    );
  },
};
