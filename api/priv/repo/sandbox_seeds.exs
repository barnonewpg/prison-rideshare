alias PrisonRideshare.Repo

alias PrisonRideshareWeb.{
  Commitment,
  GasPrice,
  Institution,
  Person,
  Post,
  Reimbursement,
  Ride,
  Slot,
  User
}

import Money.Sigils

Faker.start()

defmodule SandboxSeeds do
  def create_ride(params) do
    today = Timex.beginning_of_day(Timex.local())

    merged =
      Map.merge(params, %{
        start: Timex.shift(today, params.relative_start),
        end: Timex.shift(Timex.shift(today, params.relative_start), params.relative_end),
        address: Faker.Address.street_address(),
        contact: Faker.Phone.EnUs.phone(),
        name: Faker.Name.first_name(),
        institution_id: params.institution.id,
        request_confirmed: true,
      })

    merged =
      case Map.has_key?(merged, :driver) do
        true -> Map.merge(merged, %{driver_id: params.driver.id})
        false -> merged
      end

    merged =
      case Map.has_key?(merged, :car_owner) do
        true -> Map.merge(merged, %{car_owner_id: params.car_owner.id})
        false -> merged
      end

    merged =
      case Map.has_key?(merged, :first_time) do
        true -> Map.merge(merged, %{first_time: params.first_time})
        false -> merged
      end
    
    merged =
      case Map.has_key?(params, :request_confirmed) do
        true -> Map.merge(merged, %{request_confirmed: params.request_confirmed})
        false -> merged
      end

    PaperTrail.insert!(Ride.changeset(%Ride{}, merged), SandboxSeeds.version_information())
  end

  def create_person(name) do
    PaperTrail.insert!(
      Person.changeset(%Person{
        name: name,
        email: "#{String.replace(String.downcase(name), " ", ".")}@example.com",
        mobile: Faker.Phone.EnUs.phone(),
        address: Faker.Address.street_address(),
      }),
      SandboxSeeds.version_information()
    )
  end

  def version_information do
    [origin: "sandbox"]
  end
end

user =
  User.changeset(%User{}, %{
    name: "Sandbox",
    email: "jorts@jants.ca",
    password: "password",
    password_confirmation: "password",
    confirmed_at: DateTime.utc_now()
  })
  |> PaperTrail.insert!(SandboxSeeds.version_information())

User.admin_changeset(user, %{admin: true})
|> PaperTrail.update!(SandboxSeeds.version_information())

other_user =
  User.changeset(%User{}, %{
    name: "Other",
    email: "other@example.com",
    password: "password",
    password_confirmation: "password",
    confirmed_at: DateTime.utc_now()
  })
  |> PaperTrail.insert!(SandboxSeeds.version_information())

headingley =
  PaperTrail.insert!(
    Institution.changeset(%Institution{name: "Headingley", far: false}),
    SandboxSeeds.version_information()
  )

milner_ridge =
  PaperTrail.insert!(
    Institution.changeset(%Institution{name: "Milner Ridge", far: true}),
    SandboxSeeds.version_information()
  )

stony_mountain =
  PaperTrail.insert!(
    Institution.changeset(%Institution{name: "Stony Mountain", far: false}),
    SandboxSeeds.version_information()
  )

john_henderson =
  PaperTrail.insert!(
    Institution.changeset(%Institution{name: "John Henderson Junior High", far: false}),
    SandboxSeeds.version_information()
  )

cnuth = SandboxSeeds.create_person("Cnuth")
sara = SandboxSeeds.create_person("Sara Ahmed")
chelsea = SandboxSeeds.create_person("Chelsea Manning")
brian = SandboxSeeds.create_person("Brian Pallister")

SandboxSeeds.create_ride(%{
  relative_start: [days: 1, hours: 13, minutes: 30],
  relative_end: [hours: 1, minutes: 30],
  institution: headingley,
  driver: cnuth,
  car_owner: sara,
  request_notes: "This ride is in the future!",
  medium: "txt"
})

next_week_ride =
  SandboxSeeds.create_ride(%{
    relative_start: [days: 7, hours: 15],
    relative_end: [hours: 3],
    institution: milner_ridge,
    first_time: true,
    medium: "phone"
  })

SandboxSeeds.create_ride(%{
  relative_start: [days: 7, hours: 15, minutes: 15],
  relative_end: [hours: 3, minutes: 30],
  institution: milner_ridge,
  medium: "phone",
  request_confirmed: false
})

SandboxSeeds.create_ride(%{
  relative_start: [days: 7, hours: 15],
  relative_end: [hours: 3, minutes: 15],
  institution: milner_ridge,
  combined_with_ride_id: next_week_ride.id,
  medium: "txt"
})

SandboxSeeds.create_ride(%{
  relative_start: [days: -7, hours: 12],
  relative_end: [hours: 2],
  institution: headingley,
  passengers: 3,
  distance: 25,
  complete: true,
  food_expenses: ~M[1200],
  car_expenses: ~M[625],
  request_notes: "Some request notes",
  report_notes: "It happened! These are my notes.",
  driver: chelsea,
  car_owner: chelsea,
  medium: "txt"
})

last_month_ride =
  SandboxSeeds.create_ride(%{
    relative_start: [days: -30, hours: 8],
    relative_end: [hours: 4],
    institution: milner_ridge,
    distance: 150,
    complete: true,
    food_expenses: ~M[1414],
    car_expenses: ~M[3000],
    driver: sara,
    car_owner: sara,
    medium: "email"
  })

brian_ride =
  SandboxSeeds.create_ride(%{
    relative_start: [days: -9, hours: 5],
    relative_end: [minutes: 45],
    institution: john_henderson,
    passengers: 4,
    distance: 12556,
    complete: true,
    food_expenses: ~M[1900000],
    car_expenses: ~M[502240],
    donation: true,
    driver: brian,
    car_owner: brian,
    medium: "phone"
  })

PaperTrail.insert!(
  %Reimbursement{
    ride: last_month_ride,
    person: sara,
    food_expenses: ~M[1414]
  },
  SandboxSeeds.version_information()
)

PaperTrail.insert!(
  %Reimbursement{
    ride: last_month_ride,
    person: sara,
    car_expenses: ~M[100]
  },
  SandboxSeeds.version_information()
)

SandboxSeeds.create_ride(%{
  relative_start: [days: -11, hours: 9],
  relative_end: [hours: 2],
  institution: milner_ridge,
  enabled: false,
  cancellation_reason: "visitor"
})

SandboxSeeds.create_ride(%{
  relative_start: [days: -1, hours: 11],
  relative_end: [hours: 1, minutes: 45],
  institution: headingley,
  driver: chelsea,
  car_owner: chelsea
})

SandboxSeeds.create_ride(%{
  relative_start: [days: -3, hours: 16],
  relative_end: [hours: 2],
  institution: stony_mountain,
  driver: cnuth,
  car_owner: brian,
  medium: "phone"
})

SandboxSeeds.create_ride(%{
  relative_start: [days: -11, hours: 17],
  relative_end: [hours: 2, minutes: 30],
  institution: stony_mountain,
  driver: cnuth,
  car_owner: cnuth,
  medium: "txt"
})

reimbursed_ride =
  SandboxSeeds.create_ride(%{
    relative_start: [days: -45, hours: 9],
    relative_end: [hours: 2, minutes: 30],
    institution: headingley,
    distance: 22,
    complete: true,
    food_expenses: ~M[999],
    car_expenses: ~M[550],
    driver: sara,
    car_owner: sara,
    medium: "txt"
  })

PaperTrail.insert!(
  %Reimbursement{
    ride: reimbursed_ride,
    person: sara,
    food_expenses: ~M[999]
  },
  SandboxSeeds.version_information()
)

PaperTrail.insert!(
  %Reimbursement{
    ride: reimbursed_ride,
    person: sara,
    car_expenses: ~M[550]
  },
  SandboxSeeds.version_information()
)

processed_ride =
  SandboxSeeds.create_ride(%{
    relative_start: [days: -50, hours: 8],
    relative_end: [hours: 2, minutes: 15],
    institution: headingley,
    distance: 25,
    complete: true,
    food_expenses: ~M[500],
    car_expenses: ~M[625],
    driver: sara,
    car_owner: sara,
    medium: "txt"
  })

PaperTrail.insert!(
  %Reimbursement{
    ride: processed_ride,
    person: sara,
    food_expenses: ~M[500],
    processed: true,
    donation: true
  },
  SandboxSeeds.version_information()
)

PaperTrail.insert!(
  %Reimbursement{
    ride: processed_ride,
    person: sara,
    car_expenses: ~M[625],
    processed: true,
    donation: true
  },
  SandboxSeeds.version_information()
)

PaperTrail.insert!(%Reimbursement{
  ride: brian_ride,
  person: brian,
  food_expenses: ~M[1900000]
}, SandboxSeeds.version_information())

PaperTrail.insert!(%Reimbursement{
  ride: brian_ride,
  person: brian,
  car_expenses: ~M[502240],
  donation: true
}, SandboxSeeds.version_information())

today = Timex.beginning_of_day(Timex.local())

Enum.reduce(-60..0, ~M[110], fn days_ago, price ->
  PaperTrail.insert!(%GasPrice{
    inserted_at: Timex.add(today, Timex.Duration.from_days(days_ago)) |> DateTime.to_naive |> NaiveDateTime.truncate(:second),
    price: price
  }, SandboxSeeds.version_information())

  Money.add(price, Enum.random([-3, -2, -1, 0, 1, 2, 3, 4]))
end)

[a_slot |
  [_ |
    [_ |
      [_ |
        [b_slot | 
          [c_slot | 
            [_ | 
              [_ | 
                [_ |
                  [_ |
                    [_ | 
                      [_ | 
                        [_ | 
                          [_ | 
                            [d_slot | _]]]]]]]]]]]]]]] = Repo.all(Slot)

PaperTrail.insert!(%Commitment{
  person: brian,
  slot: a_slot
}, SandboxSeeds.version_information())

PaperTrail.insert!(%Commitment{
  person: cnuth,
  slot: b_slot
}, SandboxSeeds.version_information())

PaperTrail.insert!(%Commitment{
  person: brian,
  slot: c_slot
}, SandboxSeeds.version_information())

PaperTrail.insert!(%Commitment{
  person: brian,
  slot: d_slot
}, SandboxSeeds.version_information())

overlap_ride =
  SandboxSeeds.create_ride(%{
    relative_start: [days: 6, hours: 13],
    relative_end: [hours: 2, minutes: 30],
    institution: john_henderson,
    medium: "phone"
  })

overlap_slot = PaperTrail.insert!(%Slot{
  # Inserted as a bare struct rather than a changeset, so nothing casts these
  # for us: :naive_datetime rejects the microseconds Timex carries along.
  start: Timex.shift(overlap_ride.start, [hours: -1]) |> NaiveDateTime.truncate(:second),
  end: Timex.shift(overlap_ride.end, [minutes: 30]) |> NaiveDateTime.truncate(:second),
}, SandboxSeeds.version_information())

PaperTrail.insert!(%Commitment{
  person: brian,
  slot: overlap_slot
}, SandboxSeeds.version_information())

today = Timex.beginning_of_day(Timex.local())

PaperTrail.insert!(%Post{
  poster: user,
  inserted_at: Timex.shift(today, [days: -9, hours: 9, minutes: 22]) |> DateTime.to_naive |> NaiveDateTime.truncate(:second),
  content: "Here is a blog post with some **bold text**."
}, SandboxSeeds.version_information())

PaperTrail.insert!(%Post{
  poster: other_user,
  inserted_at: Timex.shift(today, [days: -2, hours: 1, minutes: 33]) |> DateTime.to_naive |> NaiveDateTime.truncate(:second),
  content: "# A heading\n\nThis is another blog post by a different user."
}, SandboxSeeds.version_information())
